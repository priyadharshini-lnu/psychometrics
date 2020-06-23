import React, { useReducer, useEffect } from 'react'
import _ from 'lodash'
import {
  Button, Card, Col,
} from 'antd'
import { browserName } from 'react-device-detect'
import { Config } from 'modules/user/modules/threesixtyCampaign/core/checkingWizard/interfaces'
import { CheckOutlined, RightOutlined } from '@ant-design/icons'
import ColoredButton from 'components/ColoredButton'
import transcribe, { closeSocket as closeSpeechDetectionSocket } from 'libs/amazon-transcribe-websocket-static/lib/main'
import styles from './styles.scss'
import Progress from '../Progress'
import CheckList from '../CheckList'
import { CheckListStatus } from '../interfaces'
import reducer, {
  initialState, updateAccess, updateSpeechDetection, State,
} from './reducer'

const SPEECH_DETECTION_TIME_FRAME = 60000

const { I18n } = window


interface Props {
  nextStep: () => void
  preSignUrl: () => void
  config: Config
  preSignedUrl: string
}


const AudioCheck: React.FC<Props> = ({ nextStep, preSignUrl, preSignedUrl }) => {
  useEffect(() => {
    preSignUrl()
  },
  [])
  const [state, dispatch] = useReducer(reducer, initialState)

  const requestAccess = () => {
    const speechDetectionTimer = setTimeout(() => {
      dispatch(updateSpeechDetection(CheckListStatus.Failed))
      closeSpeechDetectionSocket()
    }, SPEECH_DETECTION_TIME_FRAME)

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        dispatch(updateAccess(CheckListStatus.Done))
        transcribe(preSignedUrl, stream, (t: string) => handleTranscriptionResults(t, speechDetectionTimer), () => {
          dispatch(updateSpeechDetection(CheckListStatus.Failed))
          clearInterval(speechDetectionTimer)
        })
      })
      .catch(() => {
        dispatch(updateAccess(CheckListStatus.Failed))
      })
  }

  const handleTranscriptionResults = (transcription, speechDetectionTimer) => {
    const testMessage = sanitize(I18n.t('checking_wizard.audio_check.test_message'))
    const input = sanitize(transcription)
    if (input.includes(testMessage)) {
      clearInterval(speechDetectionTimer)
      dispatch(updateSpeechDetection(CheckListStatus.Done))
      closeSpeechDetectionSocket()
    }
  }
  const sanitize = (text: string): string => _.toLower(text.replace(/[.,\s]/g, ''))

  const rerun = () => {
    requestAccess()
    if (state.access === CheckListStatus.Failed) return

    dispatch(updateSpeechDetection(CheckListStatus.InProgress))
  }

  const getPercent = (): number => {
    const total = [state.access, state.speechDetection].length
    const { true: completedActions } = _.countBy([state.access, state.speechDetection], s => s === CheckListStatus.Done)
    return _.round(100 * (completedActions || 0) / total)
  }

  return (
    <>
      <Col className={styles.container} lg={16} xs={24} sm={24}>
        {_.includes([CheckListStatus.InProgress, CheckListStatus.Failed], state.access)
         && <IntroCard requestAccess={requestAccess} state={state} preSignedUrl={preSignedUrl} />}
        {state.access === CheckListStatus.Done && (
        <RecordCard
          state={state}
          requestAccess={requestAccess}
          preSignedUrl={preSignedUrl}
        />
        )}
      </Col>
      <Col className={styles.container} lg={8} xs={24} sm={24}>
        <Card className={styles.card}>
          <Progress percent={getPercent()} title={I18n.t('checking_wizard.audio_check.processing')} />
          <CheckList
            className="mt24"
            dataSource={[
              { name: I18n.t('checking_wizard.audio_check.access'), status: state.access },
              { name: I18n.t('checking_wizard.audio_check.speech_detection'), status: state.speechDetection },
            ]}
          />
          {state.access !== CheckListStatus.Failed && state.speechDetection !== CheckListStatus.Failed ? (
            <Button
              type="primary"
              className={styles.continueButton}
              onClick={nextStep}
              disabled={state.access !== CheckListStatus.Done || state.speechDetection !== CheckListStatus.Done}
            >
              {I18n.t('checking_wizard.audio_check.continue')}
              <RightOutlined />
            </Button>
          )
            : (
              <Button
                type="primary"
                className={styles.continueButton}
                onClick={rerun}
              >
                {I18n.t('checking_wizard.video_check.run_again')}
                <RightOutlined />
              </Button>
            )
          }

        </Card>
      </Col>
    </>
  )
}

export default AudioCheck

interface CardProps {
  requestAccess: () => void
  state: State
  preSignedUrl: string
}

const IntroCard: React.FC<CardProps> = ({ requestAccess, state, preSignedUrl }) => (
  <Card className={styles.card}>
    <div className={styles.title}>{I18n.t('checking_wizard.audio_check.title')}</div>
    <div className={styles.audio}>
      <div className={styles.iconContainer}>
        <span className={styles.icon} />
      </div>
      <div className={styles.allowTitle}>
        {I18n.t('checking_wizard.audio_check.allow_title')}
      </div>
      {state.access === CheckListStatus.InProgress && (
      <ColoredButton
        type="primary"
        className={styles.allowButton}
        color="green"
        onClick={requestAccess}
        disabled={!preSignedUrl}
      >
        <CheckOutlined />
        {I18n.t('checking_wizard.audio_check.allow')}
      </ColoredButton>
      )}
      {state.access === CheckListStatus.Failed && (
      <ColoredButton type="primary" className={styles.allowButton} color="green">
        <a
          href={`https://www.google.com/search?q=allow+camera+and+microphone+access+on+${browserName}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {I18n.t('checking_wizard.audio_check.access_help')}
        </a>
      </ColoredButton>
      )}
    </div>
  </Card>
)


const RecordCard: React.FC<CardProps> = () => (
  <Card className={styles.card}>
    <div className={styles.title}>{I18n.t('checking_wizard.audio_check.record_title')}</div>
    <div className={styles.audio}>
      <div className={styles.quote}>&quot;</div>
      <div className={styles.testMessage}>
        {I18n.t('checking_wizard.audio_check.test_message')}
      </div>
    </div>
  </Card>
)
