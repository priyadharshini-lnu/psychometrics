import React, {
  FC,
  RefObject,
  useEffect,
  useState,
  ReactElement,
  useRef,
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
import { InfoCircleOutlined } from '@ant-design/icons'

import {
  transcribe,
  stopTranscription,
  OnTranscribe,
  OnTranscribeError,
} from 'libs/amazon-transcribe-websocket-static'
import { convertSecondsToMMSS } from 'utils/time'

import styles from './styles.scss'

const AUTO_SILENCE_CUTOFF_TIME_IN_SECONDS = 20
const MAXIMUM_DICTATION_ALLOWED_IN_SECONDS = 10 * 60
const LAST_ONE_MINUTE_OF_MAXIMUM_DICTATION_ALLOWED_IN_SECONDS = MAXIMUM_DICTATION_ALLOWED_IN_SECONDS - 60

const { I18n } = window

interface Props {
  preSignedUrl: string
  inputRef?: RefObject<HTMLTextAreaElement>
  value?: string
  onChange: (value: string) => void
  onToggle?: (isStarted: boolean) => void
  isDisabled?: boolean
  children: ReactElement
}

export const SpeechToTextInput: FC<Props> = ({
  preSignedUrl = '',
  value = '',
  onChange,
  onToggle,
  isDisabled = false,
  children,
}) => {
  if (preSignedUrl.length === 0) {
    return null
  }

  const [isDictating, setDictationIndicator] = useState(false)
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

  useEffect(() => {
    if (
      navigator.mediaDevices !== undefined
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

      transcribe({
        url: preSignedUrl,
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
      onToggle && onToggle(true)
    } catch (err) {
      console.error('browser permission', err)
      setTooltipText(I18n.t('assessments.dictation.allow_browser_permision'))
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

    onToggle && onToggle(false)
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
    onChange(finalValue)
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
      setTooltipText(I18n.t('assessments.dictation.dictation_inuse'))
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
    : 'secondary'

  return (
    <>
      <div className="ta-e pb-4">
        <Space>
          <Tooltip title={tooltipText}>
            <InfoCircleOutlined />
          </Tooltip>
          <Button
            type="ghost"
            onClick={isDictating ? stopDictation : startDictation}
            disabled={!canRecordAudio || isDisabled}
          >
            {isDictating
              ? I18n.t('assessments.dictation.stop_dictation')
              : I18n.t('assessments.dictation.start_dictation')}
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
                  <Typography.Text className="ps-4">
                    {I18n.t('assessments.dictation.listening')}
                  </Typography.Text>
                  <Typography.Text
                    className="ps-4"
                    type={countdownTimerTextType}
                  >
                    {convertSecondsToMMSS(countdownTimer)}
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

  if (shouldShow) {
    return (
      <Typography.Text className="ps-4" type="danger">
        {I18n.t('assessments.dictation.autostopping_in', { reverseCountdown })}
      </Typography.Text>
    )
  }
  return null
}
