import React, {
  useReducer, useRef, useEffect, useState, useCallback,
} from 'react'
import {
  Button, Flex, Alert,
} from 'antd'
import axios from 'axios'
import { connect, ConnectedProps } from 'react-redux'
import SparkMD5 from 'spark-md5'
import { AnimatePresence, motion } from 'motion/react'
import {
  RightOutlined,
  RedoOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { DirectionalBackArrowIcon } from '~/glint'
import VideoRecorder from '~/components/MediaRecorder/components/VideoRecorder'
import FloatingControlBar from '~/components/MediaRecorder/components/FloatingControlBar'
import PlaybackControlBar from '~/components/MediaRecorder/components/PlaybackControlBar'
import CountdownOverlay from '~/components/MediaRecorder/components/CountdownOverlay'
import reducer, {
  initialState, updateAccess, updateUploading, updateSpeechTestText, updateFaceDetection,
  updateSpeechVerification,
} from '~/modules/endUser/modules/campaigns/routes/CheckingWizard/VideoCheck/reducer'
import { CheckListStatus } from '~/modules/endUser/modules/campaigns/routes/CheckingWizard/interfaces'
import { useReactMediaRecorder } from '~/components/MediaRecorder/components/MediaRecorder'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  startAudioLevelMonitoring,
  cleanupAudioMonitoring,
} from '~/modules/endUser/modules/campaigns/routes/CheckingWizard/services/service'
import { useSpeechToText } from '~/hooks/useSpeechToText'
import styles from './styles.less'
import { CHECK_STATUS } from '../../common'
import { getRandomVideoTestPhrase } from '../../../../CheckingWizard/services/service'
import { useFaceDetection } from './useFaceDetection'
import { CheckList } from '../../../../CheckingWizard/CheckList'

const { I18n } = window

export const MAX_DURATION = 30

const connector = connect(
  ({ checkingWizard }: RootState) => ({
    preSignedUrl: checkingWizard.preSignedUrl,
    transcribeSupportedLocales: checkingWizard.transcribeSupportedLocales,
  }),
  {},
)

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {
  nextStep: () => void
  onPrev: () => void
  directUploadURL?: string
  postRecordingCallbackURL?: string
  setCheckStatus: (status: CHECK_STATUS.passed | CHECK_STATUS.failed | CHECK_STATUS.pending) => void
  setIsDeviceRequestGranted: (granted: boolean) => void
  onCheckAbruptlyEnded: () => void
  setFailureReason: (reason: string | null) => void
  faceDetectionEnabled: boolean
  phraseVerificationEnabled: boolean
}

interface DeviceDetails {
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];
}

const VideoCheckComponent: React.FC<Props> = ({
  nextStep, onPrev, setCheckStatus, directUploadURL = '',
  postRecordingCallbackURL = '', setIsDeviceRequestGranted,
  setFailureReason, onCheckAbruptlyEnded,
  faceDetectionEnabled, phraseVerificationEnabled,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioDetectedRef = useRef<boolean>(false)
  const stoppedSectionRef = useRef<HTMLDivElement | null>(null)

  const partIndexRef = useRef<number>(0)
  const uploadedPartsRef = useRef<{ part_number: number; etag: string }[]>([])
  const uploadIdRef = useRef<string>('')
  const assetKeyRef = useRef<string>('')
  const urlsRef = useRef<string[]>([])
  const fileSizeRef = useRef<number>(0)
  const completeUploadRef = useRef<(blob: Blob) => Promise<void>>(async () => {})
  const pendingCompleteBlobRef = useRef<Blob | null>(null)
  const uploadReadyResolverRef = useRef<(() => void) | null>(null)
  const faceDetectionRatioRef = useRef<number>(0)

  const [state, dispatch] = useReducer(reducer, initialState)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [visualizing, setVisualizing] = useState<boolean>(false)
  const [devices, setDevices] = useState<DeviceDetails>({
    videoDevices: [],
    audioDevices: [],
    audioOutputDevices: [],
  })
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(MAX_DURATION)
  const [videoReady, setVideoReady] = useState<boolean>(false)

  const {
    startDictation: startSpeech,
    stopDictation: stopSpeech,
    transcriptRef,
  } = useSpeechToText()

  const {
    isFaceCurrentlyDetected,
    faceDetectionRatio,
    reset: resetFaceDetection,
    detectionError: faceDetectionError,
  } = useFaceDetection({ videoRef, isActive: faceDetectionEnabled && isRecording, showOverlay: false })

  useEffect(() => {
    if (faceDetectionError && faceDetectionEnabled) {
      setCheckStatus(CHECK_STATUS.failed)
      setFailureReason('enduser.face_detection_error')
    }
  }, [faceDetectionError, faceDetectionEnabled])

  const onStop = React.useCallback((blobUrl: string, lastBlob: Blob, completeBlob: Blob) => {
    setVisualizing(false)
    dispatch(updateUploading(CheckListStatus.InProgress))
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    cleanupAudioMonitoring({
      audioContextRef,
      analyserRef,
      audioCheckIntervalRef,
      audioDetectedRef,
    })
    setVideoBlob(completeBlob)
    pendingCompleteBlobRef.current = completeBlob
    uploadPart(lastBlob).finally(() => {
      uploadReadyResolverRef.current?.()
      uploadReadyResolverRef.current = null
    })
  }, [stream])

  const isUploadingInProgress = state.uploading === CheckListStatus.InProgress

  const uploadPart = async (blob: Blob) => {
    const url = urlsRef.current[partIndexRef.current]
    const partNumber = partIndexRef.current + 1

    try {
      const res = await axios.put(url, blob, {
        headers: {
          'Content-Type': 'video/webm',
        },
      })

      const { etag } = res.headers
      uploadedPartsRef.current.push({ part_number: partNumber, etag })
      partIndexRef.current += 1
      fileSizeRef.current += blob.size
    } catch (error) {
      setCheckStatus(CHECK_STATUS.failed)
      setFailureReason('enduser.video_upload_failed_chunk_upload')
      dispatch(updateUploading(CheckListStatus.Failed))
    }
  }

  const getUploadData = async () => {
    if (directUploadURL) {
      const res = await axios.post(directUploadURL, {
        duration: MAX_DURATION,
      })
      return res.data
    }
  }

  const calculateMD5Checksum = async (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    const spark = new SparkMD5.ArrayBuffer()

    fileReader.onload = () => {
      spark.append(fileReader.result as ArrayBuffer)
      const base64 = btoa(spark.end(true))
      resolve(base64)
    }

    fileReader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    fileReader.readAsArrayBuffer(blob)
  })

  const completeUpload = async (completeBlob: Blob) => {
    const sortedParts = uploadedPartsRef.current.sort(
      (a, b) => a.part_number - b.part_number,
    )
    try {
      const checksum = await calculateMD5Checksum(completeBlob)

      if (phraseVerificationEnabled) {
        dispatch(updateSpeechVerification(CheckListStatus.InProgress))
      }

      const { data: record } = await axios.put(postRecordingCallbackURL, {
        upload_id: uploadIdRef.current,
        asset_key: assetKeyRef.current,
        parts: sortedParts,
        file_size: fileSizeRef.current,
        content_type: 'video/webm',
        checksum,
        test_phrase: state.speechTestText,
        locale: I18n.locale,
        transcribed_text: transcriptRef.current,
        face_detection_ratio: faceDetectionRatioRef.current,
      })
      dispatch(updateUploading(CheckListStatus.Done))
      dispatch(updateFaceDetection(CheckListStatus.Done))

      if (record.passed) {
        if (phraseVerificationEnabled) {
          dispatch(updateSpeechVerification(CheckListStatus.Done))
        }
        setCheckStatus(CHECK_STATUS.passed)
      } else {
        if (phraseVerificationEnabled && record.phrase_verification_status === 'completed' && !record.phrase_matched) {
          dispatch(updateSpeechVerification(CheckListStatus.Failed))
          setFailureReason('enduser.speech_verification_failed')
        } else if (phraseVerificationEnabled && record.phrase_verification_status === 'error') {
          dispatch(updateSpeechVerification(CheckListStatus.Failed))
          setFailureReason('enduser.speech_verification_error')
        } else if (faceDetectionEnabled && !record.face_detected) {
          setFailureReason('enduser.face_detection_failed')
        }
        setCheckStatus(CHECK_STATUS.failed)
      }
    } catch (error) {
      setCheckStatus(CHECK_STATUS.failed)
      setFailureReason('enduser.video_upload_failed_finalize')
      dispatch(updateUploading(CheckListStatus.Failed))
    }
  }

  completeUploadRef.current = completeUpload

  const {
    status,
    mediaBlobUrl,
    startRecording,
    stopRecording,
    clearBlobUrl,
    requestMediaStream,
  } = useReactMediaRecorder({
    video: true,
    audio: true,
    onChunkAvailable: uploadPart,
    onStop,
    onEnded: onCheckAbruptlyEnded,
  })

  const requestAccess = async () => {
    if (!videoRef.current) return

    try {
      const audioConstraints = selectedAudioDevice
        ? { deviceId: { exact: selectedAudioDevice } }
        : true
      const videoConstraints = selectedVideoDevice
        ? { deviceId: { exact: selectedVideoDevice } }
        : true

      const uploadData = await getUploadData()

      urlsRef.current = uploadData?.urls
      uploadIdRef.current = uploadData?.upload_id
      assetKeyRef.current = uploadData?.asset_key

      const mediaStream = await requestMediaStream({
        audio: audioConstraints,
        video: videoConstraints,
      })

      if (!mediaStream) {
        dispatch(updateAccess(CheckListStatus.Failed))
        setCheckStatus(CHECK_STATUS.failed)
        setFailureReason('enduser.video_upload_failed_camera_access')
        setIsDeviceRequestGranted(false)
        return
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }

      mediaStreamRef.current = mediaStream
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      dispatch(updateAccess(CheckListStatus.Done))
      setVisualizing(true)

      audioDetectedRef.current = false

      startAudioLevelMonitoring(
        mediaStream,
        {
          audioContextRef,
          analyserRef,
          audioCheckIntervalRef,
          audioDetectedRef,
        },
        {
          onAudioDetected: () => {},
          onNoAudio: () => {},
        },
      )
    } catch (e) {
      setCheckStatus(CHECK_STATUS.failed)
      setFailureReason('enduser.video_upload_failed_camera_access')
      dispatch(updateAccess(CheckListStatus.Failed))
    }
  }

  useEffect(() => {
    if (!mediaBlobUrl || !videoRef.current) return

    setVideoReady(false)
    videoRef.current.srcObject = null
    videoRef.current.src = mediaBlobUrl
    videoRef.current.currentTime = 0
    videoRef.current.load()

    const video = videoRef.current
    const onCanPlay = () => {
      setVideoReady(true)
      video.removeEventListener('canplay', onCanPlay)
    }
    video.addEventListener('canplay', onCanPlay)
    return () => video.removeEventListener('canplay', onCanPlay)
  }, [mediaBlobUrl])

  useEffect(() => {
    if (phraseVerificationEnabled) {
      const random = getRandomVideoTestPhrase()
      dispatch(updateSpeechTestText(random))
    }
    requestAccess()
  }, [
    directUploadURL,
    postRecordingCallbackURL,
    selectedVideoDevice,
    selectedAudioDevice,
  ])

  useEffect(() => {
    if (status !== 'stopped') return
    const element = stoppedSectionRef.current
    if (!element) return

    setTimeout(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })
    }, 400)
  }, [status])

  const videoUpload = async () => {
    if (!videoBlob) {
      dispatch(updateUploading(CheckListStatus.Failed))
      setCheckStatus(CHECK_STATUS.failed)
      setFailureReason('enduser.video_upload_failed_no_recording')
      return
    }
    dispatch(updateUploading(CheckListStatus.InProgress))
    completeUpload(videoBlob).catch(() => {
      setCheckStatus(CHECK_STATUS.failed)
      setFailureReason('enduser.video_upload_failed_finalize')
      dispatch(updateUploading(CheckListStatus.Failed))
    })
  }

  const handleStopRecording = React.useCallback(async (): Promise<void> => {
    try {
      setIsRecording(false)
      dispatch(updateFaceDetection(CheckListStatus.InProgress))
      faceDetectionRatioRef.current = faceDetectionRatio

      const uploadReadyPromise = new Promise<void>((resolve) => {
        uploadReadyResolverRef.current = resolve
      })

      stopRecording()
      setVisualizing(false)

      cleanupAudioMonitoring({
        audioContextRef,
        analyserRef,
        audioCheckIntervalRef,
        audioDetectedRef,
      })

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }

      await Promise.all([stopSpeech(), uploadReadyPromise])

      if (pendingCompleteBlobRef.current) {
        await completeUploadRef.current(pendingCompleteBlobRef.current)
        pendingCompleteBlobRef.current = null
      }

      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    } catch (e) {
      setCheckStatus(CHECK_STATUS.failed)
      setFailureReason('enduser.video_upload_failed_camera_access')
      dispatch(updateAccess(CheckListStatus.Failed))
    }
  }, [stopRecording, stopSpeech, faceDetectionRatio])

  const handleStartWithCountdown = useCallback(async () => {
    if (phraseVerificationEnabled) {
      try {
        await startSpeech(() => {
          setIsCountingDown(true)
        })
      } catch {
        setCheckStatus(CHECK_STATUS.failed)
        setFailureReason('enduser.speech_verification_error')
      }
    } else {
      setIsCountingDown(true)
    }
  }, [phraseVerificationEnabled, startSpeech])

  const handleCountdownComplete = useCallback(() => {
    setIsCountingDown(false)
    setRemainingSeconds(MAX_DURATION)
    startRecording()
    setIsRecording(true)
    setVisualizing(true)
  }, [startRecording])

  // Countdown timer for recording duration
  const recordingStartedRef = useRef<boolean>(false)
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (status === 'recording') {
      if (!recordingStartedRef.current) {
        setRemainingSeconds(MAX_DURATION)
        recordingStartedRef.current = true
      }
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            handleStopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      recordingStartedRef.current = false
    }
    return () => clearInterval(interval)
  }, [status, handleStopRecording])

  useEffect(() => {
    const getDevices = async () => {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = deviceList.filter(
        device => device.kind === 'videoinput',
      )
      const audioDevices = deviceList.filter(
        device => device.kind === 'audioinput',
      )
      const audioOutputDevices = deviceList.filter(
        device => device.kind === 'audiooutput',
      )
      setDevices({ videoDevices, audioDevices, audioOutputDevices })
      if (videoDevices.length > 0 && !selectedVideoDevice) {
        setSelectedVideoDevice(videoDevices[0].deviceId)
      }
      if (audioDevices.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(audioDevices[0].deviceId)
      }
    }
    getDevices()
  }, [selectedVideoDevice, selectedAudioDevice])

  const rerun = async () => {
    setCheckStatus(CHECK_STATUS.pending)
    clearBlobUrl()
    setVideoBlob(null)
    setVideoReady(false)
    dispatch(updateUploading(CheckListStatus.Pending))
    dispatch(updateSpeechVerification(CheckListStatus.Pending))

    // Reset upload refs
    partIndexRef.current = 0
    uploadedPartsRef.current = []
    uploadIdRef.current = ''
    assetKeyRef.current = ''
    urlsRef.current = []
    fileSizeRef.current = 0

    cleanupAudioMonitoring({
      audioContextRef,
      analyserRef,
      audioCheckIntervalRef,
      audioDetectedRef,
    })

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.src = ''
    }

    faceDetectionEnabled && resetFaceDetection()
    dispatch(updateFaceDetection(CheckListStatus.InProgress))
    requestAccess()
  }

  const handleVideoPlay = (): void => {
    setVisualizing(true)
  }

  const hasRecordedVideo = status === 'stopped' && !!mediaBlobUrl
  const isLoading = hasRecordedVideo && !videoReady
  const isPlaybackReady = hasRecordedVideo && videoReady

  // Determine which bar to show
  let barKey = 'idle'
  if (status === 'recording') barKey = 'recording'
  else if (isLoading) barKey = 'loading'
  else if (isPlaybackReady) barKey = 'playback'


  const handleChangeVideoDevice = (deviceId: string) => {
    setSelectedVideoDevice(deviceId)
  }

  const handleChangeAudioDevice = (deviceId: string) => {
    setSelectedAudioDevice(deviceId)
  }

  const isCheckPassed = state.uploading === CheckListStatus.Done
  const isCheckStopped = status === 'stopped'

  const renderActionButtons = () => {
    if (!isCheckStopped) return null

    if (state.uploading === CheckListStatus.Failed) {
      return (
        <Button
          onClick={videoUpload}
          icon={<RedoOutlined />}
          loading={isUploadingInProgress}
        >
          {I18n.t('enduser.system_check_upload_again')}
        </Button>
      )
    }

    if (status === 'stopped' && isCheckPassed) {
      return (
        <>
          <Button
            onClick={rerun}
            icon={<RedoOutlined />}
            disabled={isUploadingInProgress}
          >
            {I18n.t('enduser.system_check_retake')}
          </Button>
          <Button
            type="primary"
            onClick={nextStep}
            disabled={!isCheckPassed}
          >
            {I18n.t('enduser.system_check_proceed')}
            <RightOutlined />
          </Button>
        </>
      )
    }

    return null
  }

  const renderProgressAndChecklist = () => (
    <CheckList
      className="w-100"
      dataSource={[
        { name: I18n.t('enduser.system_check_access'), status: state.access },
        { name: I18n.t('enduser.system_check_uploading'), status: state.uploading },
      ]}
    />
  )

  return (
    <Flex align="center" vertical gap={8}>
      <Flex className={styles['video-player-parent']} style={{ position: 'relative' }}>
        <VideoRecorder
          videoRef={videoRef}
          mediaUrl={mediaBlobUrl}
          permissionGranted={state.access === CheckListStatus.Done}
          status={status}
          onPlay={handleVideoPlay}
          visualizing={visualizing}
          stream={mediaStreamRef.current}
          renderControlBar={(stream: MediaStream) => (
            stream
              ? (
                <>
                  {isCountingDown && (
                    <CountdownOverlay onComplete={handleCountdownComplete} />
                  )}
                  <AnimatePresence mode="wait">
                    {barKey === 'loading' && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={styles.loadingBar}
                      >
                        <span className={styles.loadingSpinner} />
                        {I18n.t('enduser.preparing_preview')}
                      </motion.div>
                    )}
                    {(barKey === 'idle' || barKey === 'recording') && (
                      <motion.div
                        key="controls"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FloatingControlBar
                          status={status}
                          isRecording={status === 'recording'}
                          hasMedia={!!mediaBlobUrl}
                          onStartRecording={handleStartWithCountdown}
                          onStopRecording={handleStopRecording}
                          onDiscard={rerun}
                          remainingSeconds={remainingSeconds}
                          maxDuration={MAX_DURATION}
                          stream={stream}
                          audioDevices={devices.audioDevices}
                          onChangeAudioDevice={handleChangeAudioDevice}
                          onChangeVideoDevice={handleChangeVideoDevice}
                          videoDevices={devices.videoDevices}
                          selectedVideoDeviceId={selectedVideoDevice}
                          selectedAudioDeviceId={selectedAudioDevice}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <>
                  {barKey === 'playback' && (
                    <motion.div
                      key="playback"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <PlaybackControlBar videoRef={videoRef} />
                    </motion.div>
                  )}
                </>
              )
          )}
          maxRecordingDuration={status === 'recording' ? MAX_DURATION : undefined}
        />
      </Flex>

      {faceDetectionEnabled && status === 'recording' && !isFaceCurrentlyDetected && (
        <Alert
          style={{ width: '100%' }}
          message={I18n.t('enduser.face_not_detected_warning')}
          type="warning"
        />
      )}

      {
        status === 'stopped' && (
          <Flex className="w-100">
            {renderProgressAndChecklist()}
          </Flex>
        )}
      <Flex ref={stoppedSectionRef} className="mb-2 w-100" justify="space-between">
        <Button icon={<DirectionalBackArrowIcon />} onClick={onPrev}>
          {I18n.t('enduser.back')}
        </Button>
        <Flex justify="end" wrap gap={12}>
          {renderActionButtons()}
        </Flex>
      </Flex>
    </Flex>
  )
}

export const VideoCheck = connector(VideoCheckComponent)
