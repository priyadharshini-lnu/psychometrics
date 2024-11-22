import React, { useReducer, useEffect, useRef } from 'react'
import _ from 'lodash'
import {
  Button, Card, Col,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'

import { CheckOutlined, RightOutlined } from '@ant-design/icons'
import { Buffer } from 'buffer'
import { preSignUrl } from '~/modules/endUser/modules/campaigns/core/checkingWizard'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { AudioLevel } from '~/hooks/useAudioMetrics/interfaces'
import { RECORDER_STATES } from '~/modules/survey/constants/media'
import { stopTranscription, transcribe } from '~/libs/amazon-transcribe-websocket-static'
import useAudioMetrics from '~/hooks/useAudioMetrics'
import { RecorderCore } from '~/modules/survey/utils/RecorderCore'
import { BROWSER_NAME } from '~/utils/uaParser'
import DynamicAudioIcon from '~/components/DynamicAudioIcon'
import { Progress } from '../Progress'
import { CheckList } from '../CheckList'
import { CheckListStatus } from '../interfaces'
import reducer, {
  initialState, updateAccess, updateSpeechDetection, State, updateTranscriptionMessage,
} from './reducer'

import styles from './AudioCheck.less'

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

const SPEECH_DETECTION_TIME_FRAME = 10000
const { I18n } = window

const AudioCheckComponent: React.FC<Props> = ({
  nextStep, preSignUrl, preSignedUrl, transcribeSupportedLocales,
}) => {
  useEffect(() => {
    preSignUrl()
    initRecorder()
  },
  [])
  const [state, dispatch] = useReducer(reducer, initialState)
  const recorderRef = useRef<RecorderCore>()
  const [{ level, pulse }, { updatePulse, resetMetrics }] = useAudioMetrics(recorderRef)


  const initRecorder = (): void => {
    recorderRef.current = new RecorderCore({ onUpdateRecordTime: () => null })
  }

  const requestAccess = () => {
    const speechDetectionTimer = setTimeout(() => {
      dispatch(updateSpeechDetection(CheckListStatus.Failed))
      stopTranscription()
      recorderRef.current?.stop()
      resetMetrics()
    }, SPEECH_DETECTION_TIME_FRAME)

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        window.addEventListener(RECORDER_STATES.RECORDING, updatePulse)
        recorderRef.current?.start()
        dispatch(updateAccess(CheckListStatus.Done))
        transcribe({
          url: preSignedUrl,
          stream,
          onTranscribe: (t: string) => handleTranscriptionResults(t, speechDetectionTimer),
          onError: () => {
            recorderRef.current?.stop()
            resetMetrics()
            dispatch(updateSpeechDetection(CheckListStatus.Failed))
            clearInterval(speechDetectionTimer)
          },
        })
      })
      .catch(() => {
        dispatch(updateAccess(CheckListStatus.Failed))
      })
  }

  const handleTranscriptionResults = (transcription, speechDetectionTimer) => {
    const testMessage = sanitize(getTranscriptionMessage(transcribeSupportedLocales))
    const input = sanitize(transcription)
    dispatch(updateTranscriptionMessage(transcription))
    if (input.includes(testMessage)) {
      clearInterval(speechDetectionTimer)
      dispatch(updateSpeechDetection(CheckListStatus.Done))
      stopTranscription()
      recorderRef.current?.stop()
      resetMetrics()
    }
  }
  const sanitize = (text: string): string => _.toLower(text.replace(/[.,\s]/g, ''))

  const rerun = () => {
    requestAccess()
    if (state.access === CheckListStatus.Failed) return

    dispatch(updateTranscriptionMessage(''))
    dispatch(updateSpeechDetection(CheckListStatus.InProgress))
  }

  const getPercent = (): number => {
    const total = [state.access, state.speechDetection].length
    const { true: completedActions } = _.countBy([state.access, state.speechDetection], s => s === CheckListStatus.Done)
    return _.round(100 * (completedActions || 0) / total)
  }

  return (
    <>
      <title>{`${I18n.t('checking_wizard.audio_check.title')}`}</title>
      <Col className={styles.container} lg={16} xs={24} sm={24}>
        {_.includes([CheckListStatus.InProgress, CheckListStatus.Failed], state.access)
         && (
         <IntroCard
           requestAccess={requestAccess}
           state={state}
           preSignedUrl={preSignedUrl}
         />
         )}
        {state.access === CheckListStatus.Done && (
        <RecordCard
          pulse={pulse}
          transcribeSupportedLocales={transcribeSupportedLocales}
          level={level}
          state={state}
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

export const AudioCheck = connector(AudioCheckComponent)

interface CardProps {
  state: State
}
type IntroCardProps = {
  requestAccess: () => void
  preSignedUrl: string
} & CardProps
type RecordCardProps = {
  level: AudioLevel
  pulse: number
  transcribeSupportedLocales: string[]
} & CardProps

const IntroCard: React.FC<IntroCardProps> = ({ requestAccess, state, preSignedUrl }) => (
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
      <Button
        type="primary"
        onClick={requestAccess}
        disabled={!preSignedUrl}
      >
        <CheckOutlined />
        {I18n.t('checking_wizard.audio_check.allow')}
      </Button>
      )}
      {state.access === CheckListStatus.Failed && (
      <Button type="primary">
        <a
          href={`https://www.google.com/search?q=allow+camera+and+microphone+access+on+${BROWSER_NAME}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {I18n.t('checking_wizard.audio_check.access_help')}
        </a>
      </Button>
      )}
    </div>
  </Card>
)


const RecordCard: React.FC<RecordCardProps> = ({
  level, pulse, state, transcribeSupportedLocales,
}) => (
  <Card className={styles.card}>
    <div className={styles.title}>{I18n.t('checking_wizard.audio_check.record_title')}</div>
    <div className={styles.audio}>
      <div className={styles.quote}>&quot;</div>
      <div className={styles.testMessage}>
        {getTranscriptionMessage(transcribeSupportedLocales)}
      </div>
      <DynamicAudioIcon level={level} pulse={pulse} />
      <div className={styles.testMessage}>
        {state.transcriptionMessage}
      </div>
    </div>
  </Card>
)

const getTranscriptionMessage = (transcribeSupportedLocales: string[]) => {
  if (_.includes(transcribeSupportedLocales, I18n.locale)) {
    return I18n.t('checking_wizard.audio_check.test_message')
  }

  return I18n.t('checking_wizard.audio_check.test_message', { locale: 'en' })
}
