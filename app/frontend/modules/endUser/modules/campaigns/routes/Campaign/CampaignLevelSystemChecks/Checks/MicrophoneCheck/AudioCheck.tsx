import React, {
  useReducer, useEffect, useRef, useState, useContext,
  forwardRef,
} from 'react'
import {
  Button, Card,
  Flex,
  Space,
  Typography,
  Alert,
  Select,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import axios from 'axios'
import SparkMD5 from 'spark-md5'
import { Buffer } from 'buffer'
import cs from 'classnames'
import {
  RedoOutlined, RightOutlined, StopOutlined, VideoCameraOutlined, AudioOutlined, DownOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { CountdownTimer } from '~/glint/components/CountdownTimer'
import AudioWaveVisualizer from '~/components/MediaRecorder/components/AudioWaveVisualizer'
import { useReactMediaRecorder, StatusMessages } from '~/components/MediaRecorder/components/MediaRecorder'
import { preSignUrl } from '~/modules/endUser/modules/campaigns/core/checkingWizard'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { CheckList } from '~/modules/endUser/modules/campaigns/routes/CheckingWizard/CheckList'
import { CheckListStatus } from '~/modules/endUser/modules/campaigns/routes/CheckingWizard/interfaces'
import reducer, {
  initialState, updateAccess, updateUploading, updateSpeechTestText, State,
} from '~/modules/endUser/modules/campaigns/routes/CheckingWizard/VideoCheck/reducer'
import styles from '~/modules/endUser/modules/campaigns/routes/CheckingWizard/AudioCheck/AudioCheck.less'
import {
  getRandomAudioTestPhrase, startAudioLevelMonitoring,
  cleanupAudioMonitoring,
} from '~/modules/endUser/modules/campaigns/routes/CheckingWizard/services/service'
import { RANDOM_CONSTS_ARRAY } from '~/modules/endUser/modules/campaigns/routes/CheckingWizard/services/consts'
import { CHECK_STATUS } from '../../common'
import { MediaQueryContext } from '~/glint'

const MAX_DURATION = 30

window.Buffer = Buffer

const connector = connect(({ checkingWizard }: RootState) => ({
  preSignedUrl: checkingWizard.preSignedUrl,
  transcribeSupportedLocales: checkingWizard.transcribeSupportedLocales,
}), {
  preSignUrl,
})

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & {
  nextStep: () => void
  directUploadURL?: string
  postRecordingCallbackURL?: string
  setCheckStatus: (status: CHECK_STATUS.passed | CHECK_STATUS.failed | CHECK_STATUS.pending) => void
  setIsDeviceRequestGranted: (granted: boolean) => void
  setNoAudioDetected: (noAudio: boolean) => void
}

interface DeviceDetails {
  audioDevices: MediaDeviceInfo[]
}

const { I18n } = window

const AudioCheckComponent: React.FC<Props> = ({
  nextStep, setCheckStatus, postRecordingCallbackURL = '', directUploadURL = '', setIsDeviceRequestGranted,
  setNoAudioDetected,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
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
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [showAudioWarning, setShowAudioWarning] = useState<boolean>(false)
  const [devices, setDevices] = useState<DeviceDetails>({ audioDevices: [] })
  const [devicesLoaded, setDevicesLoaded] = useState<boolean>(false)
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')

  const { isMobile } = useContext(MediaQueryContext)

  const onStop = React.useCallback((blobUrl: string, lastBlob: Blob, completeBlob: Blob) => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
    }
    cleanupAudioMonitoring({
      audioContextRef,
      analyserRef,
      audioCheckIntervalRef,
      audioDetectedRef,
    })
    setAudioBlob(completeBlob)

    if (showAudioWarning) {
      setCheckStatus(CHECK_STATUS.failed)
      dispatch(updateUploading(CheckListStatus.Failed))
      setNoAudioDetected(true)
      return
    }

    uploadPart(lastBlob).then(() => {
      completeUpload(completeBlob)
    })
  }, [showAudioWarning])


  const isAccessDone = state.access === CheckListStatus.Done
  const isUploadingInProgress = state.uploading === CheckListStatus.InProgress

  const uploadPart = async (blob:Blob) => {
    const url = urlsRef.current[partIndexRef.current]
    const partNumber = partIndexRef.current + 1

    try {
      const res = await axios.put(url, blob, {
        headers: {
          'Content-Type': 'audio/webm',
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

  const {
    status,
    mediaBlobUrl,
    startRecording,
    stopRecording,
    clearBlobUrl,
    requestMediaStream,
  } = useReactMediaRecorder({
    video: false,
    audio: true,
    onChunkAvailable: uploadPart,
    onStop,
  })

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
        content_type: 'audio/webm',
        checksum,
      })
      setCheckStatus(CHECK_STATUS.passed)
      dispatch(updateUploading(CheckListStatus.Done))
    } catch (error) {
      setCheckStatus(CHECK_STATUS.failed)
      dispatch(updateUploading(CheckListStatus.Failed))
    }
  }

  useEffect(() => {
    if (!devicesLoaded) {
      return
    }

    if (devices.audioDevices.length > 0 && !selectedAudioDevice) {
      return
    }

    const random = getRandomAudioTestPhrase(RANDOM_CONSTS_ARRAY)
    dispatch(updateSpeechTestText(random))
    requestAccess()
  }, [devicesLoaded, directUploadURL, postRecordingCallbackURL, selectedAudioDevice])

  useEffect(() => {
    const getDevices = async () => {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      const audioDevices = deviceList.filter(device => device.kind === 'audioinput')

      setDevices({ audioDevices })

      if (audioDevices.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(audioDevices[0].deviceId)
      }

      setDevicesLoaded(true)
    }

    getDevices()
  }, [])

  useEffect(() => {
    if (mediaBlobUrl && audioRef.current) {
      audioRef.current.srcObject = null
      audioRef.current.src = mediaBlobUrl
      audioRef.current.currentTime = 0
      audioRef.current.load()

      if (!urlsRef.current) requestAccess()
    }
  }, [mediaBlobUrl])


  const renderActionButton = () => {
    if (status === 'recording') {
      return (
        <Flex vertical align="center" gap={8}>
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
        }}
        type="primary"
        icon={<VideoCameraOutlined />}
      >
        {I18n.t('enduser.system_check_start_recording')}
      </Button>
    )
  }

  const Controls:React.FC = () => (
    <Flex className="mt-12" gap={8}>
      {!mediaBlobUrl && renderActionButton()}
    </Flex>
  )

  const requestAccess = async () => {
    if (!audioRef.current) {
      return
    }


    try {
      const audioConstraints = selectedAudioDevice
        ? { deviceId: { exact: selectedAudioDevice } }
        : true

      const uploadData = await getUploadData()

      urlsRef.current = uploadData?.urls
      uploadIdRef.current = uploadData?.upload_id
      assetKeyRef.current = uploadData?.asset_key

      const mediaStream = await requestMediaStream({
        audio: audioConstraints,
      })

      if (!mediaStream) {
        dispatch(updateAccess(CheckListStatus.Failed))
        setCheckStatus(CHECK_STATUS.failed)
        setIsDeviceRequestGranted(false)
        return
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }

      cleanupAudioMonitoring({
        audioContextRef,
        analyserRef,
        audioCheckIntervalRef,
        audioDetectedRef,
      })

      mediaStreamRef.current = mediaStream

      if (audioRef.current) {
        audioRef.current.srcObject = mediaStream
      }
      dispatch(updateAccess(CheckListStatus.Done))

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
      if (!mediaStreamRef.current) {
        setIsDeviceRequestGranted(false)
      }
      setCheckStatus(CHECK_STATUS.failed)
      dispatch(updateAccess(CheckListStatus.Failed))
    }
  }

  const handleChangeAudioDevice = (deviceId: string) => {
    setSelectedAudioDevice(deviceId)
  }

  const audioUpload = async () => {
    if (!audioBlob) {
      dispatch(updateUploading(CheckListStatus.Failed))
      setCheckStatus(CHECK_STATUS.failed)
      return
    }
    dispatch(updateUploading(CheckListStatus.InProgress))
    completeUpload(audioBlob).then(() => {
      setCheckStatus(CHECK_STATUS.passed)
      dispatch(updateUploading(CheckListStatus.Done))
    }).catch(() => {
      setCheckStatus(CHECK_STATUS.failed)
      dispatch(updateUploading(CheckListStatus.Failed))
    })
  }

  const rerun = () => {
    setCheckStatus(CHECK_STATUS.pending)
    clearBlobUrl()
    setAudioBlob(null)
    setShowAudioWarning(false)
    dispatch(updateUploading(CheckListStatus.Pending))

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

    if (audioRef.current) {
      audioRef.current.srcObject = null
      audioRef.current.src = ''
    }

    requestAccess()
  }


  const handleStopRecording = React.useCallback((): void => {
    stopRecording()

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

    if (audioRef.current) {
      audioRef.current.srcObject = null
    }
  }, [stopRecording])


  const renderProgressAndChecklist = () => (
    <div className="mt-6" style={{ alignSelf: 'stretch' }}>
      <CheckList
        className="mt24"
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
        <Space className="m-6">
          {isAccessDone && (
            <Button
              onClick={rerun}
              icon={<RedoOutlined />}
              disabled={isUploadingInProgress}
            >
              {I18n.t('enduser.system_check_retake')}
            </Button>
          )}
          <Button
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
          className="m-6"
          onClick={audioUpload}
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
        className="m-6"
        onClick={rerun}
        icon={<RedoOutlined />}
      >
        {I18n.t('enduser.system_check_run_again')}
      </Button>
    )
  }


  return (
    <div className={styles.container}>
      <Flex align="center" vertical className={styles.card} style={{ width: 'auto' }}>
        <Flex
          justify="flex-end"
          align="flex-end"
          className="w-100"
          gap={4}
          style={{
            flex: '1',
          }}
        >
          <AudioOutlined className="self-center" />
          <Select
            placeholder={I18n.t('assessments.video_response.device_selection.mic')}
            onChange={handleChangeAudioDevice}
            suffixIcon={<DownOutlined style={{ pointerEvents: 'none' }} />}
            disabled={status === 'recording'}
            value={selectedAudioDevice || undefined}
            styles={{
              root: { minWidth: 240 },
              popup: { root: { width: '300px', ...(isMobile ? { right: '-100%', width: '200px' } : {}) } },
            }}
            options={devices.audioDevices.map(device => ({
              value: device.deviceId,
              label: device.label || `Microphone ${device.deviceId}`,
            }))}
            variant="borderless"
          />
        </Flex>

        <RecordCard
          mediaBlobUrl={mediaBlobUrl}
          stream={mediaStreamRef.current}
          handleStopRecording={handleStopRecording}
          status={status}
          state={state}
          ref={audioRef}
        />

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
              {renderProgressAndChecklist()}
              {renderButtons()}
            </>

          )}

      </Flex>
    </div>

  )
}

export const AudioCheck = connector(AudioCheckComponent)


type RecordCardProps = {
  mediaBlobUrl: undefined | string;
  stream: MediaStream | null;
  handleStopRecording : () => void;
  status: StatusMessages
  state: State,
}


const RecordCard = forwardRef<HTMLAudioElement, RecordCardProps>(({
  mediaBlobUrl, stream, handleStopRecording, state, status,
}, ref) => (
  <>
    <Card
      className={cs(styles.audioCard, 'pos-rel', 'flex', 'flex-column')}
      style={{ width: '100%' }}
    >
      <div
        className={cs(styles.audio, 'h-100', 'flex', 'flex-column')}
        style={{
          flex: 1,
        }}
      >
        <h4 className={styles.title}>{I18n.t('enduser.system_check_audio_title')}</h4>
        <div className={styles.testMessage}>
          &#8220;
          {state.speechTestText}
          &#8221;
        </div>
        {status === 'recording' && (
          <>
            <Flex justify="center" align="center" className={styles.recordingIndicator}>
              <div className={styles.dot} />
              <Typography.Text className={styles.rec}>
                {I18n.t('shared.rec')}
              </Typography.Text>
              <CountdownTimer
                onFinish={handleStopRecording}
                className={styles.countdownIndicator}
                seconds={MAX_DURATION}
              />
            </Flex>
            <AudioWaveVisualizer
              stream={stream}
              audioBlobUrl={mediaBlobUrl}
            />
          </>
        )}

      </div>
      <audio
        preload="metadata"
        className={cs(styles.audioElement, 'pos-rel')}
        ref={ref}
        src={mediaBlobUrl}
        controls={!!mediaBlobUrl}
        style={{
          width: '100%',
          left: '0px',
          top: 'unset',
        }}
      />
    </Card>

  </>
))
