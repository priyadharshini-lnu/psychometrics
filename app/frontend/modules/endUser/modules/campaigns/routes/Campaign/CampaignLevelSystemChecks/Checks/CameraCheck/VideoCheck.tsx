import React, {
  useReducer, useRef, useEffect, useState,
} from 'react'
import {
  Button, Flex, Space, Alert,
} from 'antd'
import axios from 'axios'
import { connect, ConnectedProps } from 'react-redux'
import SparkMD5 from 'spark-md5'
import {
  StopOutlined, VideoCameraOutlined, RightOutlined, RedoOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import VideoPlayer from '~/components/MediaRecorder/components/VideoPlayer'
import { CheckList } from '~/modules/endUser/modules/campaigns/routes/CheckingWizard/CheckList'
import reducer, {
  initialState, updateAccess, updateUploading, updateSpeechTestText,
} from '~/modules/endUser/modules/campaigns/routes/CheckingWizard/VideoCheck/reducer'
import { CheckListStatus } from '~/modules/endUser/modules/campaigns/routes/CheckingWizard/interfaces'
import { useReactMediaRecorder } from '~/components/MediaRecorder/components/MediaRecorder'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  startAudioLevelMonitoring,
  cleanupAudioMonitoring,
} from '~/modules/endUser/modules/campaigns/routes/CheckingWizard/services/service'
import styles from './styles.less'
import { CHECK_STATUS } from '../../common'
import { getRandomVideoTestPhrase } from '../../../../CheckingWizard/services/service'

const { I18n } = window

export const MAX_DURATION = 30

const connector = connect(({ checkingWizard }: RootState) => ({
  preSignedUrl: checkingWizard.preSignedUrl,
  transcribeSupportedLocales: checkingWizard.transcribeSupportedLocales,
}), {
})

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & {
  nextStep: () => void
  directUploadURL?: string
  postRecordingCallbackURL?: string
  setCheckStatus: (status: CHECK_STATUS.passed | CHECK_STATUS.failed | CHECK_STATUS.pending) => void
  setIsDeviceRequestGranted: (granted: boolean) => void
  onCheckAbruptlyEnded: () => void
}

interface DeviceDetails {
  videoDevices : MediaDeviceInfo[];
  audioDevices : MediaDeviceInfo[];
}

const VideoCheckComponent: React.FC<Props> = ({
  nextStep, setCheckStatus, directUploadURL = '', postRecordingCallbackURL = '', setIsDeviceRequestGranted,
  onCheckAbruptlyEnded,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioDetectedRef = useRef<boolean>(false)

  const partIndexRef = useRef<number>(0)
  const uploadedPartsRef = useRef<{ part_number: number, etag: string }[]>([])
  const uploadIdRef = useRef<string>('')
  const assetKeyRef = useRef<string>('')
  const urlsRef = useRef<string[]>([])
  const fileSizeRef = useRef<number>(0)


  const [state, dispatch] = useReducer(reducer, initialState)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [visualizing, setVisualizing] = useState<boolean>(false)
  const [showAudioWarning, setShowAudioWarning] = useState<boolean>(false)
  const [devices, setDevices] = useState<DeviceDetails>({ videoDevices: [], audioDevices: [] })
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')

  const onStop = React.useCallback((blobUrl: string, lastBlob: Blob, completeBlob: Blob) => {
    setVisualizing(false)
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

    uploadPart(lastBlob).then(() => {
      completeUpload(completeBlob)
    })
  }, [stream])

  const isAccessDone = state.access === CheckListStatus.Done
  const isUploadingInProgress = state.uploading === CheckListStatus.InProgress

  const uploadPart = async (blob:Blob) => {
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
    const sortedParts = uploadedPartsRef.current.sort((a, b) => a.part_number - b.part_number)
    try {
      const checksum = await calculateMD5Checksum(completeBlob)

      await axios.put(postRecordingCallbackURL, {
        upload_id: uploadIdRef.current,
        asset_key: assetKeyRef.current,
        parts: sortedParts,
        file_size: fileSizeRef.current,
        content_type: 'video/webm',
        checksum,
      })
      setCheckStatus(CHECK_STATUS.passed)
      dispatch(updateUploading(CheckListStatus.Done))
    } catch (error) {
      setCheckStatus(CHECK_STATUS.failed)
      dispatch(updateUploading(CheckListStatus.Failed))
    }
  }

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
        setIsDeviceRequestGranted(false)
        return
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
          onAudioDetected: () => setShowAudioWarning(false),
          onNoAudio: () => setShowAudioWarning(true),
        },
      )
    } catch (e) {
      setCheckStatus(CHECK_STATUS.failed)
      dispatch(updateAccess(CheckListStatus.Failed))
    }
  }

  useEffect(() => {
    if ((mediaBlobUrl) && videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.src = mediaBlobUrl
      videoRef.current.currentTime = 0
      videoRef.current.load()
    }
  }, [mediaBlobUrl])

  useEffect(() => {
    const random = getRandomVideoTestPhrase()
    dispatch(updateSpeechTestText(random))
    requestAccess()
  }, [directUploadURL, postRecordingCallbackURL])

  const videoUpload = async () => {
    if (!videoBlob) {
      dispatch(updateUploading(CheckListStatus.Failed))
      setCheckStatus(CHECK_STATUS.failed)
      return
    }
    dispatch(updateUploading(CheckListStatus.InProgress))
    completeUpload(videoBlob).then(() => {
      setCheckStatus(CHECK_STATUS.passed)
      dispatch(updateUploading(CheckListStatus.Done))
    }).catch(() => {
      setCheckStatus(CHECK_STATUS.failed)
      dispatch(updateUploading(CheckListStatus.Failed))
    })
  }

  const handleStopRecording = React.useCallback(async (): Promise<void> => {
    try {
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
    } catch (e) {
      setCheckStatus(CHECK_STATUS.failed)
      dispatch(updateAccess(CheckListStatus.Failed))
    }
  }, [stopRecording])

  const renderActionButton = () => {
    if (status === 'recording') {
      return (
        <Flex vertical align="center" gap={8} justify="end">
          <Button onClick={handleStopRecording} type="primary" danger icon={<StopOutlined />}>
            {I18n.t('enduser.system_check_stop_recording')}
          </Button>
        </Flex>
      )
    }

    return (
      <Button
        onClick={() => {
          startRecording()
          setVisualizing(true)
        }}
        type="primary"
        icon={<VideoCameraOutlined />}
      >
        {I18n.t('enduser.system_check_start_recording')}
      </Button>
    )
  }

  useEffect(() => {
    const getDevices = async () => {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput')
      const audioDevices = deviceList.filter(device => device.kind === 'audioinput')
      setDevices({ videoDevices, audioDevices })
      if (videoDevices.length > 0 && !selectedVideoDevice) {
        setSelectedVideoDevice(videoDevices[0].deviceId)
      }
      if (audioDevices.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(audioDevices[0].deviceId)
      }
    }
    getDevices()
  }, [selectedVideoDevice, selectedAudioDevice])

  const Controls:React.FC = () => (
    <Flex className="m-16" gap={8}>
      {!mediaBlobUrl && renderActionButton()}
    </Flex>
  )

  const rerun = async () => {
    setCheckStatus(CHECK_STATUS.pending)
    clearBlobUrl()
    setVideoBlob(null)
    setShowAudioWarning(false)
    dispatch(updateUploading(CheckListStatus.Pending))

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
    requestAccess()
  }

  const handleVideoPlay = (): void => {
    setVisualizing(true)
  }

  const handleChangeVideoDevice = (deviceId: string) => {
    setSelectedVideoDevice(deviceId)
  }

  const handleChangeAudioDevice = (deviceId: string) => {
    setSelectedAudioDevice(deviceId)
  }

  const renderProgressAndChecklist = () => (
    <div className="mt-0" style={{ alignSelf: 'stretch' }}>
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
        <Space className="mt-8">
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
          className="mt-8"
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
        className="mt-8"
        onClick={rerun}
        icon={<RedoOutlined />}
      >
        {I18n.t('enduser.system_check_run_again')}
      </Button>
    )
  }

  return (
    <Flex align="center" vertical gap={4}>
      <h3>{I18n.t('checking_wizard.video_check.title')}</h3>
      <p>{I18n.t('checking_wizard.video_check.description')}</p>
      {
         ['idle', 'recording'].includes(status)
        && (
          <>
            <h3 className={styles.testMessage}>
              &#8220;
              {state.speechTestText}
              &#8221;
            </h3>
          </>
        )
      }
      <Flex className={styles['video-player-parent']}>

        <VideoPlayer
          videoRef={videoRef}
          mediaUrl={mediaBlobUrl}
          permissionGranted={state.access === CheckListStatus.Done}
          status={status}
          showCountdownTimer
          duration={MAX_DURATION}
          onFinish={handleStopRecording}
          onPlay={handleVideoPlay}
          visualizing={visualizing}
          stream={mediaStreamRef.current}
          videoDevices={devices.videoDevices}
          audioDevices={devices.audioDevices}
          onChangeVideoDevice={handleChangeVideoDevice}
          onChangeAudioDevice={handleChangeAudioDevice}
        />
      </Flex>


      {showAudioWarning && status === 'recording' && (
        <Alert
          title={I18n.t('enduser.no_audio_warning')}
          type="warning"
          className="mt-4"
        />
      )}

      <Controls />
      {
        status === 'stopped' && (
          <>
            <Alert style={{ width: '100%' }} title={I18n.t('enduser.check_video_recording')} type="info" />
            {renderProgressAndChecklist()}
            {renderButtons()}
          </>
        )}
    </Flex>
  )
}

export const VideoCheck = connector(VideoCheckComponent)
