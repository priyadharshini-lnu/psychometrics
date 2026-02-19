import React, {
  useReducer, useEffect, useRef, useState,
} from 'react'
import {
  Button, Card,
  Flex,
  Space,
  Typography,
  Alert,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { DirectUpload } from '@rails/activestorage'
import axios from 'axios'

import { Buffer } from 'buffer'
import {
  RedoOutlined, RightOutlined, StopOutlined, VideoCameraOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { CountdownTimer } from '~/glint/components/CountdownTimer'
import AudioWaveVisualizer from '~/components/MediaRecorder/components/AudioWaveVisualizer'
import { useReactMediaRecorder, StatusMessages } from '~/components/MediaRecorder/components/MediaRecorder'
import { preSignUrl } from '~/modules/endUser/modules/campaigns/core/checkingWizard'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { CheckList } from '../CheckList'
import { CheckListStatus } from '../interfaces'
import reducer, {
  initialState, updateAccess, State, updateSpeechTestText, updateUploading,
} from '../VideoCheck/reducer'

import styles from './AudioCheck.less'
import { getRandomAudioTestPhrase, startAudioLevelMonitoring, cleanupAudioMonitoring } from '../services/service'
import { RANDOM_CONSTS_ARRAY } from '../services/consts'
import { MAX_DURATION } from '../VideoCheck/VideoCheck'

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
}

const { I18n } = window

const AudioCheckComponent: React.FC<Props> = ({
  nextStep, preSignUrl,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioDetectedRef = useRef<boolean>(false)

  const [state, dispatch] = useReducer(reducer, initialState)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [showAudioWarning, setShowAudioWarning] = useState<boolean>(false)

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
  }, [])

  const {
    status,
    mediaBlobUrl,
    startRecording,
    stopRecording,
    clearBlobUrl,
  } = useReactMediaRecorder({
    video: false,
    audio: true,
    onStop,
  })

  const getMediaStream = React.useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      return stream
    } catch (error) {
      console.error('Error accessing media stream:', error)
      return null
    }
  }, [])

  const isAccessDone = state.access === CheckListStatus.Done
  const isUploadingInProgress = state.uploading === CheckListStatus.InProgress


  useEffect(() => {
    preSignUrl()
    const random = getRandomAudioTestPhrase(RANDOM_CONSTS_ARRAY)
    dispatch(updateSpeechTestText(random))
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
    return () => {
      if (mediaBlobUrl) {
        URL.revokeObjectURL(mediaBlobUrl)
      }
    }
  }, [mediaBlobUrl, audioRef])

  useEffect(() => {
    if (audioBlob && status === 'stopped') {
      audioUpload()
    }
  }, [audioBlob, status])


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
        onClick={() => requestAccess()}
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
    try {
      const mediaStream = await window.navigator.mediaDevices.getUserMedia({
        audio: true,
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

      startRecording()
    } catch (e) {
      dispatch(updateAccess(CheckListStatus.Failed))
    }
  }

  const audioUpload = async () => {
    if (!audioBlob) {
      dispatch(updateUploading(CheckListStatus.Failed))
      return
    }
    const upload = new DirectUpload(
      audioBlob,
      `${location.pathname}/upload_user_verification_media_url?media_type=audio`,
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
      media_type: 'audio',
    }, {
      headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
    }).then(() => {
      dispatch(updateUploading(CheckListStatus.Done))
    }).catch(() => {
      dispatch(updateUploading(CheckListStatus.Failed))
    })
  }


  const rerun = () => {
    clearBlobUrl()
    setAudioBlob(null)
    setShowAudioWarning(false)
    dispatch(updateUploading(CheckListStatus.Pending))

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

      <Flex align="center" vertical className={styles.card}>
        <RecordCard
          mediaBlobUrl={mediaBlobUrl}
          getMediaStream={getMediaStream}
          handleStopRecording={handleStopRecording}
          status={status}
          state={state}
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
      {mediaBlobUrl
     && (
       <audio
         preload="metadata"
         className={styles.audioElement}
         ref={audioRef}
         src={mediaBlobUrl}
         controls={!!mediaBlobUrl}
       />
     )
     }

    </div>

  )
}

export const AudioCheck = connector(AudioCheckComponent)


type RecordCardProps = {
  mediaBlobUrl: undefined | string;
  getMediaStream: () => Promise<MediaStream | null>
  handleStopRecording : () => void;
  status: StatusMessages
  state: State,
}


const RecordCard: React.FC<RecordCardProps> = ({
  mediaBlobUrl, getMediaStream, handleStopRecording, state, status,
}) => (
  <>
    <h4 className={styles.title}>{I18n.t('enduser.system_check_audio_title')}</h4>
    <Card className={styles.audioCard}>
      <div className={styles.audio}>
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
              getMediaStream={getMediaStream}
              audioBlobUrl={mediaBlobUrl}
            />
          </>
        )}
      </div>
    </Card>
  </>
)
