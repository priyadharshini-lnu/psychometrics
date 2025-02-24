import React, {
  useReducer, useEffect, useRef,
} from 'react'
import {
  Button, Card,
  Flex,
  Space,
  Typography,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'

import {
  RedoOutlined, RightOutlined, StopOutlined, VideoCameraOutlined,
} from '@ant-design/icons'
import { Buffer } from 'buffer'
import { CountdownTimer } from '~/glint/components/CountdownTimer'
import AudioWaveVisualizer from '~/components/MediaRecorder/components/AudioWaveVisualizer'
import { useReactMediaRecorder, StatusMessages } from '~/components/MediaRecorder/components/MediaRecorder'
import { preSignUrl } from '~/modules/endUser/modules/campaigns/core/checkingWizard'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { CheckList } from '../CheckList'
import { CheckListStatus } from '../interfaces'
import reducer, {
  initialState, updateAccess, State, updateSpeechTestText,
} from '../VideoCheck/reducer'

import styles from './AudioCheck.less'
import { getRandomAudioTestPhrase } from '../services/service'
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
  const {
    status,
    mediaBlobUrl,
    startRecording,
    stopRecording,
    clearBlobUrl,
  } = useReactMediaRecorder({
    video: true,
    audio: true,
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


  const [state, dispatch] = useReducer(reducer, initialState)

  const audioRef = useRef<HTMLAudioElement | null>(null)


  useEffect(() => {
    preSignUrl()
    const random = getRandomAudioTestPhrase(RANDOM_CONSTS_ARRAY)
    dispatch(updateSpeechTestText(random))
  },
  [])

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


  const renderActionButton = () => {
    if (status === 'recording') {
      return (
        <Flex vertical align="center" gap={8}>
          <Button onClick={handleStopRecording} type="primary" danger icon={<StopOutlined />}>
            {I18n.t('assessments.video_response.stop_recording')}
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
        {I18n.t('assessments.video_response.start_recording')}
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
      if (audioRef.current) {
        audioRef.current.srcObject = mediaStream
      }
      dispatch(updateAccess(CheckListStatus.Done))
      startRecording()
    } catch (e) {
      dispatch(updateAccess(CheckListStatus.Failed))
    }
    dispatch(updateAccess(CheckListStatus.Done))
  }


  const rerun = () => {
    clearBlobUrl()
    requestAccess()
  }


  const handleStopRecording = React.useCallback((): void => {
    stopRecording()
  }, [stopRecording])


  const renderProgressAndChecklist = () => (
    <div className="mt-6" style={{ alignSelf: 'stretch' }}>
      <CheckList
        className="mt24"
        dataSource={[
          { name: I18n.t('checking_wizard.audio_check.access'), status: state.access },
        ]}
      />
    </div>
  )

  const renderButtons = () => {
    if (state.access !== CheckListStatus.Failed) {
      return (
        <Space className="m-6">
          <Button
            onClick={rerun}
            icon={<RedoOutlined />}
          >
            {I18n.t('checking_wizard.audio_check.retake')}
          </Button>
          <Button
            type="primary"
            className={styles.continueButton}
            onClick={nextStep}
          >
            {I18n.t('checking_wizard.audio_check.continue')}
            <RightOutlined />
          </Button>
        </Space>

      )
    }
    return (
      <Button
        type="primary"
        className="mt-16"
        onClick={rerun}
        icon={<RedoOutlined />}
      >
        {I18n.t('checking_wizard.audio_check.run_again')}
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
    <h4 className={styles.title}>{I18n.t('checking_wizard.audio_check.record_title')}</h4>
    <Card className={styles.audioCard}>
      <div className={styles.audio}>
        <div className={styles.testMessage}>
          &#8220;
          {state.speechTestText}
          &#8221;
        </div>
        {
          status === 'recording'
        && (
          <>
            <Flex justify="center" align="center" className={styles.recordingIndicator}>
              <div className={styles.dot} />
              <Typography.Text className={styles.rec}>
                {I18n.t('checking_wizard.video_check.rec_text')}
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
        )
      }

      </div>
    </Card>
  </>
)
