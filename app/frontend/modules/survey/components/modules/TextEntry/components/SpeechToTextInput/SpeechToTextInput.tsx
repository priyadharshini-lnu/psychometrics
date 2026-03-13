import {
  FC, useEffect, useState, ReactElement, useRef, useMemo,
} from 'react'
import {
  Button,
  Col,
  Row,
  Space,
  Tooltip,
  Typography,
  Progress,
  notification as antdNotification,
} from 'antd'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import {
  transcribe,
  stopTranscription,
  OnTranscribe,
  OnTranscribeError,
} from '~/libs/amazon-transcribe-websocket-static'
import {
  convertSecondsToMMSS, secondsToDayHoursAndMinutes, countdownAlertInMinutes, countdownAlertInSeconds,
} from '~/utils/time'

import styles from './styles.less'

const AUTO_SILENCE_CUTOFF_TIME_IN_SECONDS = 20
const MAXIMUM_DICTATION_ALLOWED_IN_SECONDS = 10 * 60
const LAST_ONE_MINUTE_OF_MAXIMUM_DICTATION_ALLOWED_IN_SECONDS = MAXIMUM_DICTATION_ALLOWED_IN_SECONDS - 60

const { I18n } = window

const screenReaderNotificationIntervals = {
  first: MAXIMUM_DICTATION_ALLOWED_IN_SECONDS - (MAXIMUM_DICTATION_ALLOWED_IN_SECONDS / 2),
  second: MAXIMUM_DICTATION_ALLOWED_IN_SECONDS - (MAXIMUM_DICTATION_ALLOWED_IN_SECONDS / 5),
  third: MAXIMUM_DICTATION_ALLOWED_IN_SECONDS - (MAXIMUM_DICTATION_ALLOWED_IN_SECONDS / 6),
}

export interface Props {
  value?: string
  onValueChange: (value: string) => void
  onDictationChange?: (isStarted: boolean) => void
  isDisabled?: boolean
  fetchPresignUrl(): Promise<{ response: { url: string } }>
  children: ReactElement
  tooltipId?: string
}

export const SpeechToTextInput: FC<Props> = ({
  value = '',
  onValueChange,
  onDictationChange,
  fetchPresignUrl,
  isDisabled = false,
  children,
  tooltipId,
}) => {
  const [isDictating, setDictationIndicator] = useState(false)
  const [isLoading, setLoadingIndication] = useState(false)
  const [canRecordAudio, setCanRecordAudio] = useState(false)
  const [tooltipText, setTooltipText] = useState('')

  const [countdownTimer, setCountdownTimer] = useState(0)
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [autoSilenceCutoffTimer, setAutoSilenceCutoffTimer] = useState(0)
  const autoSilenceCutoffTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const audioAnalyzerRef = useRef<AnalyserNode | null>(null)
  const analyzerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [analyzerLevel, setAnalyzerLevel] = useState(0)
  const tooltipContainerRef = useRef(null)
  const screenReaderNotificationRef = useRef<HTMLSpanElement>(null)

  const recordingTimeCountDownForScreenReader = useMemo(() => countdownAlertInMinutes(countdownTimer), [countdownTimer])

  useEffect(() => {
    if (
      navigator
      && navigator.mediaDevices !== undefined
      && navigator.mediaDevices.getUserMedia !== undefined
    ) {
      setCanRecordAudio(true)
      setTooltipText(I18n.t('assessments.dictation.use_speech_instructions'))
    } else {
      setCanRecordAudio(false)
      setTooltipText(I18n.t('assessments.dictation.browser_unsupported'))
    }
  }, [])

  const startDictation = async () => {
    setLoadingIndication(true)

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      const AudioContext = window.AudioContext || window.webkitAudioContext
      const audioCtx = new AudioContext()
      const audioSourceNode = audioCtx.createMediaStreamSource(audioStream)
      const audioAnalyzer = audioCtx.createAnalyser()
      audioSourceNode.connect(audioAnalyzer)
      audioAnalyzer.fftSize = 256
      audioAnalyzer.minDecibels = -90
      audioAnalyzer.maxDecibels = -10

      audioContextRef.current = audioCtx
      audioAnalyzerRef.current = audioAnalyzer

      const {
        response: { url },
      } = await fetchPresignUrl()

      setLoadingIndication(false)

      if (url.length === 0) {
        throw new Error('no_url')
      }

      transcribe({
        url,
        stream: audioStream,
        onTranscribe: handleTranscription,
        onError: handleTranscriptionError,
        onSilence: handleTranscriptionSilence,
      })

      countdownTimerRef.current = setInterval(() => {
        setCountdownTimer(countdownTimer => countdownTimer + 1)
      }, 1000)

      analyzerTimerRef.current = setInterval(() => {
        refreshAnalyzerVisualization()
      }, 100)

      setDictationIndicator(true)
      setTooltipText(I18n.t('assessments.dictation.dictation_active'))

      if (onDictationChange) {
        onDictationChange(true)
      }
    } catch (err) {
      console.error('start dictation', err.name, err.message)
      setLoadingIndication(false)

      if (err && err.message === 'no_url') {
        antdNotification.error({
          message: I18n.t('assessments.dictation.dictation_not_started'),
          description: I18n.t('assessments.dictation.no_dictation_url'),
        })
      } else if (err && err.name === 'NotAllowedError') {
        antdNotification.warning({
          message: I18n.t('assessments.dictation.dictation_not_started'),
          description: I18n.t('assessments.dictation.allow_browser_permision'),
        })
      } else {
        antdNotification.error({
          message: I18n.t('assessments.dictation.dictation_not_started'),
        })
      }
    }
  }

  const refreshAnalyzerVisualization = () => {
    const bufferLength = audioAnalyzerRef.current?.frequencyBinCount ?? 0

    const amplitudeArray = new Uint8Array(bufferLength)
    audioAnalyzerRef.current?.getByteFrequencyData(amplitudeArray)

    const sumAmplitude = amplitudeArray.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    )
    const averageAmplitude = Math.round(sumAmplitude / bufferLength)
    const amplitude = (averageAmplitude / 256) * 1000

    setAnalyzerLevel(amplitude)
  }

  const stopDictation = async () => {
    stopTranscription()

    setDictationIndicator(false)
    setTooltipText(I18n.t('assessments.dictation.use_speech_instructions'))

    clearCountdownTimer()
    clearAutosilenceTimer()
    clearAnalyzerTimer()

    await audioContextRef.current?.close()

    if (onDictationChange) {
      onDictationChange(false)
    }
  }

  const handleTranscription: OnTranscribe = (transcription) => {
    clearAutosilenceTimer()

    const initialValue = value ?? ''

    const formattedTranscription = transcription
      .toLowerCase()
      .replace('.', '')
      .replace('?', '')
      .replace('!', '')
      .replace(/\r?\n|\r/g, ' ')

    const finalValue = `${initialValue} ${formattedTranscription}`
    onValueChange(finalValue)
  }

  const handleTranscriptionError: OnTranscribeError = (
    message,
    additionalMessage,
  ) => {
    console.error('err in speech to text', message, additionalMessage)
    antdNotification.error({
      message: I18n.t('assessments.dictation.dictation_stopped'),
      description: I18n.t('assessments.dictation.notifications.refresh_page'),
    })
    stopDictation()
  }

  const handleTranscriptionSilence = () => {
    if (!autoSilenceCutoffTimerRef.current) {
      autoSilenceCutoffTimerRef.current = setInterval(() => {
        setAutoSilenceCutoffTimer(
          autoSilenceCutoffTimer => autoSilenceCutoffTimer + 1,
        )
      }, 1000)
    }
  }

  const clearAutosilenceTimer = () => {
    autoSilenceCutoffTimerRef.current
      && clearInterval(autoSilenceCutoffTimerRef.current)
    setAutoSilenceCutoffTimer(0)
    autoSilenceCutoffTimerRef.current = null
  }

  const clearCountdownTimer = () => {
    countdownTimerRef.current && clearInterval(countdownTimerRef.current)
    setCountdownTimer(0)
    countdownTimerRef.current = null
  }

  const clearAnalyzerTimer = () => {
    analyzerTimerRef.current && clearInterval(analyzerTimerRef.current)
    setAnalyzerLevel(0)
    analyzerTimerRef.current = null
  }

  useEffect(() => {
    if (screenReaderNotificationRef.current && (countdownTimer === screenReaderNotificationIntervals.first
      || countdownTimer === screenReaderNotificationIntervals.second
      || countdownTimer === screenReaderNotificationIntervals.third)
    ) {
      const remainingDictationTime = MAXIMUM_DICTATION_ALLOWED_IN_SECONDS - countdownTimer
      screenReaderNotificationRef.current.innerText = `${secondsToDayHoursAndMinutes(
        remainingDictationTime, undefined, undefined, I18n.t('assessments.dictation.minutes'),
      )} ${I18n.t('assessments.dictation.left')}`
    }
  }, [countdownTimer])

  // Effect running on every timers
  useEffect(() => {
    if (
      autoSilenceCutoffTimer === AUTO_SILENCE_CUTOFF_TIME_IN_SECONDS
      || countdownTimer === MAXIMUM_DICTATION_ALLOWED_IN_SECONDS
    ) {
      stopDictation()
    }

    if (autoSilenceCutoffTimer === AUTO_SILENCE_CUTOFF_TIME_IN_SECONDS) {
      antdNotification.warning({
        message: I18n.t('assessments.dictation.dictation_stopped'),
        description: I18n.t('assessments.dictation.notifications.autostopped', {
          autocutoff: AUTO_SILENCE_CUTOFF_TIME_IN_SECONDS,
        }),
      })
    }
  }, [countdownTimer, autoSilenceCutoffTimer])

  useEffect(() => {
    if (isDisabled) {
      setTooltipText(I18n.t('assessments.dictation.dictation_disabled'))
    } else {
      setTooltipText(I18n.t('assessments.dictation.use_speech_instructions'))
    }
  }, [isDisabled])

  // cleanup effect
  useEffect(
    () => () => {
      stopDictation()
    },
    [],
  )

  const countdownTimerTextType = countdownTimer > LAST_ONE_MINUTE_OF_MAXIMUM_DICTATION_ALLOWED_IN_SECONDS
    ? 'danger'
    : undefined

  let buttonText = I18n.t('assessments.dictation.start_dictation')
  if (isDictating) {
    buttonText = I18n.t('assessments.dictation.stop_dictation')
  }

  return (
    <>
      <div className="ta-e pb-4">
        <Space>
          <Tooltip
            getPopupContainer={() => tooltipContainerRef.current || document.body}
            trigger={['focus', 'hover']}
            title={tooltipText}
          >
            <span>
              <InfoCircleOutlined aria-describedby={tooltipId} tabIndex={0} aria-label="Information: Dictation" />
            </span>
          </Tooltip>
          <Button
            type="primary"
            ghost
            onClick={isDictating ? stopDictation : startDictation}
            disabled={!canRecordAudio || isDisabled}
            loading={isLoading}
          >
            {buttonText}
          </Button>
        </Space>
      </div>
      {children}
      <div
        className={`${styles.dictationBoxDefault} ${
          isDictating ? styles.dictationBoxShow : styles.dictationBoxHidden
        }`}
      >
        <Row justify="space-between" align="middle">
          <Col flex="1 1 auto">
            <Row>
              <Col xs={24} sm={24} md={6} lg={2} xl={2}>
                <Progress
                  percent={analyzerLevel}
                  size="small"
                  strokeColor="#237804"
                  showInfo={false}
                  steps={16}
                />
              </Col>
              <Col flex="auto">
                <Space>
                  <Typography.Text role="alert" aria-live="polite" className="ps-4">
                    {I18n.t('assessments.dictation.listening')}
                  </Typography.Text>
                  <Typography.Text
                    className="ps-4"
                    type={countdownTimerTextType}
                  >
                    {convertSecondsToMMSS(countdownTimer)}
                    <span
                      aria-live="polite"
                      className="sr-only"
                    >
                      {recordingTimeCountDownForScreenReader
                        && recordingTimeCountDownForScreenReader}
                    </span>
                  </Typography.Text>

                </Space>
              </Col>
            </Row>
          </Col>
          <Col>
            <AutoStopperAlert autoSilenceCutoffTimer={autoSilenceCutoffTimer} />
          </Col>
        </Row>
      </div>
      <span
        role="alert"
        aria-live="polite"
        className="sr-only"
        ref={screenReaderNotificationRef}
      />
      <div ref={tooltipContainerRef}>
        {/* This is to make tooltip content available by default in DOM for screenreader only */}
        <p id={tooltipId} className="sr-only" aria-hidden="true">{tooltipText}</p>
      </div>
    </>
  )
}

interface AutoStopperAlertProps {
  autoSilenceCutoffTimer: number
}

const AutoStopperAlert: FC<AutoStopperAlertProps> = ({
  autoSilenceCutoffTimer,
}) => {
  const shouldShow = autoSilenceCutoffTimer >= AUTO_SILENCE_CUTOFF_TIME_IN_SECONDS - 9
  const reverseCountdown = AUTO_SILENCE_CUTOFF_TIME_IN_SECONDS - autoSilenceCutoffTimer
  const autoStopCountDownForScreenReader = useMemo(() => countdownAlertInSeconds(reverseCountdown), [reverseCountdown])

  return (
    <div>
      {shouldShow ? (
        <>
          <Typography.Text className="ps-4" type="danger">
            {I18n.t('assessments.dictation.autostopping_in', { reverseCountdown })}
          </Typography.Text>
          <span
            aria-live="polite"
            className="sr-only"
          >
            {autoStopCountDownForScreenReader && I18n.t('assessments.dictation.autostopping_in',
              { reverseCountdown: autoStopCountDownForScreenReader })}
          </span>
        </>
      ) : null}
    </div>
  )
}
