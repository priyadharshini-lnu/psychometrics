import React, {
  useReducer, useRef, useEffect, useState, useCallback, useContext,
} from 'react'
import {
  Button, Flex, Space,
} from 'antd'
import { DirectUpload } from '@rails/activestorage'
import axios from 'axios'
import { connect, ConnectedProps } from 'react-redux'
import { AnimatePresence, motion } from 'motion/react'
import {
  RightOutlined, RedoOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import VideoRecorder from '~/components/MediaRecorder/components/VideoRecorder'
import FloatingControlBar from '~/components/MediaRecorder/components/FloatingControlBar'
import PlaybackControlBar from '~/components/MediaRecorder/components/PlaybackControlBar'
import CountdownOverlay from '~/components/MediaRecorder/components/CountdownOverlay'
import { CheckList } from '../CheckList'
import reducer, {
  initialState, updateAccess, updateUploading, updateSpeechTestText,
} from './reducer'
import { CheckListStatus } from '../interfaces'
import styles from './styles.less'
import { useReactMediaRecorder } from '~/components/MediaRecorder/components/MediaRecorder'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { preSignUrl } from '~/modules/endUser/modules/campaigns/core/checkingWizard'
import { getRandomVideoTestPhrase } from '../services/service'
import { useMediaPreview, VIDEO_RESOLUTION } from '~/hooks/useMediaPreview'
import { MediaQueryContext } from '~/glint'

const { I18n } = window

export const MAX_DURATION = 30

const connector = connect(({ checkingWizard }: RootState) => ({
  preSignedUrl: checkingWizard.preSignedUrl,
  transcribeSupportedLocales: checkingWizard.transcribeSupportedLocales,
}), {
  preSignUrl,
})

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & {
  nextStep: () => void
}

const VideoCheckComponent: React.FC<Props> = ({ nextStep, preSignUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const [state, dispatch] = useReducer(reducer, initialState)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [visualizing, setVisualizing] = useState<boolean>(false)
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(MAX_DURATION)

  const [videoReady, setVideoReady] = useState<boolean>(false)

  const isRerunningRef = useRef<boolean>(false)
  const { isMobile } = useContext(MediaQueryContext)

  const onStop = React.useCallback((blobUrl: string, lastBlob: Blob, completeBlob: Blob) => {
    setVisualizing(false)
    setVideoBlob(completeBlob)
  }, [])

  const isAccessDone = state.access === CheckListStatus.Done
  const isUploadingInProgress = state.uploading === CheckListStatus.InProgress

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
    onStop,
    stopStreamsOnStop: false,
  })

  const hasRecordedVideo = status === 'stopped' && !!mediaBlobUrl
  const isLoading = hasRecordedVideo && !videoReady
  const isPlaybackReady = hasRecordedVideo && videoReady


  let barKey = 'idle'
  if (status === 'recording') barKey = 'recording'
  else if (isLoading) barKey = 'loading'
  else if (isPlaybackReady) barKey = 'playback'

  const {
    previewStream,
    permissionGranted,
    devices,
    selectedVideoDevice,
    selectedAudioDevice,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
    setPreviewStream,
  } = useMediaPreview({
    shouldSkipPreview: !!mediaBlobUrl || isRerunningRef.current,
    isRecording: status === 'recording',
    requestMediaStream,
    onError: () => dispatch(updateAccess(CheckListStatus.Failed)),
  })

  useEffect(() => {
    const random = getRandomVideoTestPhrase()
    dispatch(updateSpeechTestText(random))
    requestAccess()
  }, [
    selectedVideoDevice,
    selectedAudioDevice,
  ])

  useEffect(() => {
    preSignUrl()
    const random = getRandomVideoTestPhrase()
    dispatch(updateSpeechTestText(random))

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
    if (videoBlob && status === 'stopped') {
      videoUpload()
    }
  }, [videoBlob, status])

  const recordingStartedRef = useRef<boolean>(false)

  const requestAccess = async () => {
    if (!videoRef.current) return

    try {
      if (previewStream) {
        mediaStreamRef.current = previewStream
        if (videoRef.current) {
          videoRef.current.srcObject = previewStream
        }
      } else {
        const audioConstraints = selectedAudioDevice
          ? { deviceId: { exact: selectedAudioDevice } }
          : true

        const videoConstraints = selectedVideoDevice
          ? { deviceId: { exact: selectedVideoDevice }, ...VIDEO_RESOLUTION }
          : VIDEO_RESOLUTION

        const mediaStream = await requestMediaStream({
          audio: audioConstraints,
          video: videoConstraints,
        })

        if (!mediaStream) {
          dispatch(updateAccess(CheckListStatus.Failed))
          return
        }
        mediaStreamRef.current = mediaStream
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }
      dispatch(updateAccess(CheckListStatus.Done))
    } catch (e) {
      dispatch(updateAccess(CheckListStatus.Failed))
    }
  }

  const videoUpload = async () => {
    if (!videoBlob) {
      dispatch(updateUploading(CheckListStatus.Failed))
      return
    }
    const upload = new DirectUpload(
      videoBlob,
      `${location.pathname}/upload_user_verification_media_url?media_type=video`,
      {
        directUploadWillStoreFileWithXHR: (xhr: XMLHttpRequest) => {
          xhr.upload.addEventListener('progress', () => {
            dispatch(updateUploading(CheckListStatus.InProgress))
          })
        },
      },
    )

    upload.create((error, blob) => {
      if (error) {
        dispatch(updateUploading(CheckListStatus.Failed))
      } else {
        onUploadDone(blob)
      }
    })

    dispatch(updateUploading(CheckListStatus.InProgress))
  }

  const onUploadDone = (blob) => {
    axios.put(`${location.pathname}/user_verification_media_upload_callback`, {
      media_id: blob.media_id,
      asset_key: blob.signed_id,
      media_type: 'video',
    }, {
      headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
    }).then(() => {
      dispatch(updateUploading(CheckListStatus.Done))
      isRerunningRef.current = false
    }).catch(() => {
      dispatch(updateUploading(CheckListStatus.Failed))
    })
  }

  const handleStopRecording = React.useCallback(async (): Promise<void> => {
    try {
      stopRecording()
      setVisualizing(false)

      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop())
        setPreviewStream(null)
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    } catch (e) {
      console.error('Error stopping recording:', e)
    }
  }, [stopRecording])

  const handleStartWithCountdown = useCallback(() => {
    setIsCountingDown(true)
  }, [])

  const handleCountdownComplete = useCallback(() => {
    setIsCountingDown(false)
    setRemainingSeconds(MAX_DURATION)
    startRecording()
    setVisualizing(true)
  }, [startRecording])

  const handleChangeVideoDevice = (deviceId: string) => {
    setSelectedVideoDevice(deviceId)
  }

  const handleChangeAudioDevice = (deviceId: string) => {
    setSelectedAudioDevice(deviceId)
  }

  useEffect(() => {
    let interval:ReturnType<typeof setInterval>
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

  const rerun = async () => {
    isRerunningRef.current = true
    clearBlobUrl()
    setVideoBlob(null)
    setVideoReady(false)
    dispatch(updateUploading(CheckListStatus.Pending))
    dispatch(updateAccess(CheckListStatus.Pending))

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop())
      setPreviewStream(null)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.src = ''
    }
    requestAccess()
  }

  const handleVideoPlay = (): void => {
    setVisualizing(true)
  }

  const renderProgressAndChecklist = () => (
    <div className="mt-6" style={{ alignSelf: 'stretch' }}>
      <CheckList
        className="mt14"
        dataSource={[
          { name: I18n.t('enduser.system_check_access'), status: state.access },
          { name: I18n.t('enduser.system_check_uploading'), status: state.uploading },
        ]}
      />
    </div>
  )

  const renderButtons = () => {
    if (state.uploading !== CheckListStatus.Failed) {
      return (
        <Space className="m-12">
          {isAccessDone && (
            <Button
              className={styles.continueButton}
              onClick={rerun}
              icon={<RedoOutlined />}
              disabled={isUploadingInProgress}
            >
              {I18n.t('enduser.system_check_retake')}
            </Button>
          )}
          <Button
            size="middle"
            type="primary"
            className={styles.continueButton}
            onClick={nextStep}
            disabled={isUploadingInProgress}
          >
            {I18n.t('enduser.system_check_proceed')}
            <RightOutlined />
          </Button>
        </Space>
      )
    }
    if (state.uploading === CheckListStatus.Failed) {
      return (
        <Button
          type="primary"
          className="m-12"
          onClick={videoUpload}
          icon={<RedoOutlined />}
          loading={isUploadingInProgress}
        >
          {I18n.t('enduser.system_check_upload_again')}
        </Button>
      )
    }
    return (
      <Button
        type="primary"
        className="m-12"
        onClick={rerun}
        icon={<RedoOutlined />}
      >
        {I18n.t('enduser.system_check_run_again')}
      </Button>
    )
  }

  return (
    <Flex align="center" vertical style={{ width: isMobile ? '100%' : '700px', padding: '1rem' }}>
      <h3 className="ta-c mb-4 mt-0">{I18n.t('enduser.camera_check_description')}</h3>

      <VideoRecorder
        videoRef={videoRef}
        mediaUrl={mediaBlobUrl}
        permissionGranted={permissionGranted || state.access === CheckListStatus.Done}
        status={status}
        onPlay={handleVideoPlay}
        visualizing={visualizing}
        stream={previewStream || mediaStreamRef.current}
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

      {
        status === 'stopped' && (
          <>
            {renderProgressAndChecklist()}
            {renderButtons()}
          </>
        )}


    </Flex>
  )
}

export const VideoCheck = connector(VideoCheckComponent)
