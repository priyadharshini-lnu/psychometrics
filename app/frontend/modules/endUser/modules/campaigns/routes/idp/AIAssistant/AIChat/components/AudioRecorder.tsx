import {
  useCallback, useEffect, useState, useRef,
} from 'react'
import {
  Flex, Button, Typography, Space, Tag, Statistic,
} from 'antd'
import dayjs from 'dayjs'
import Icon, {
  EditOutlined, PauseCircleOutlined,
  CheckOutlined, RightOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { ReactMediaRecorder } from '~/components/MediaRecorder/components/MediaRecorder'
import AudioWaveVisualizer from '~/components/MediaRecorder/components/AudioWaveVisualizer'
import styles from './AudioRecorder.less'
import StartIcon from '../assets/Start_Recording.svg?react'
import StopIcon from '../assets/Stop_Recording.svg?react'
import VideoRecordIcon from '../assets/Video_record.svg?react'

const { Countdown } = Statistic

const Transcription = () => (
  <Flex vertical className={styles.transcription}>
    <Flex justify="space-between">
      <Typography.Text strong>Transcript:</Typography.Text>
      <Button type="link" icon={<EditOutlined />} />
    </Flex>
    <Typography.Paragraph>
      As the Vice President of Sales, my primary responsibilities revolve around developing and executing
      our sales strategy to achieve revenue targets and expand our market share.
    </Typography.Paragraph>
    <Typography.Paragraph>
      I oversee the entire sales team, providing leadership, coaching, and support to ensure they meet
      their individual and team goals.
    </Typography.Paragraph>
  </Flex>
)

const GrantAccess = ({
  onGrantPermission, setError, selectedAudioDevice, setStream, streamRef,
}) => {
  const [, setIsRequestingPermission] = useState<boolean>(false)

  const handleRequestPermission = useCallback(async () => {
    setIsRequestingPermission(true)
    try {
      const mediaStream = await window.navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedAudioDevice },
      })
      setStream(mediaStream)
      streamRef.current = mediaStream

      onGrantPermission()
    } catch (error) {
      console.error('Permission denied:', error)
      setError('permission')('Failed to access camera and microphone')
    } finally {
      setIsRequestingPermission(false)
    }
  }, [])

  return (
    <Flex vertical justify="center" className={styles.permissionBubble} flex={1}>
      <Icon style={{ fontSize: 60 }} component={VideoRecordIcon} className={styles.recordIcon} />
      <Typography.Title level={5} className={styles.title}>Audio Interview Setup</Typography.Title>
      <Typography.Text>
        We’ll ask you 5 open-ended questions. Answer naturally — your insights help build a better plan.
      </Typography.Text>
      <Flex justify="center" className={styles.controls}>
        <Button type="primary" onClick={handleRequestPermission} size="small" icon={<CheckOutlined />}>
          Allow Microphone Access
        </Button>
      </Flex>
    </Flex>
  )
}

const Recorder = ({
  onAction, num, isCurrent, footer,
  question, status, startRecording, stopRecording, pauseRecording, resumeRecording,
}) => {
  const [, setDevices] = useState<{ audioDevices: MediaDeviceInfo[] }>({ audioDevices: [] })
  const [, setStream] = useState<MediaStream | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false)
  const [, setErrors] = useState<Record<string, string>>({})
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')
  const [remainingTime, setRemainingTime] = useState(100000)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [showTranscription, setShowTranscription] = useState<boolean>(false)

  const setError = (key: string) => (message: string) => {
    setErrors(prev => ({ ...prev, [key]: message }))
  }

  useEffect(() => {
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioDevices = devices.filter(device => device.kind === 'audioinput')

      setDevices({ audioDevices })

      const permissions = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      })

      if (audioDevices.length > 0) {
        const mediaStream = await window.navigator.mediaDevices.getUserMedia({
          audio: { deviceId: selectedAudioDevice },
        })
        setSelectedAudioDevice(audioDevices[0].deviceId)
        setStream(mediaStream)
        mediaStreamRef.current = mediaStream
      }

      setPermissionGranted(permissions.state === 'granted')
    }

    getDevices()
  }, [])

  const start = () => {
    setShowTranscription(false)
    setRemainingTime(100 * 1000) // time limit
    startRecording()
    setStartTime(Date.now())
  }

  const stop = () => {
    stopRecording()
    setShowTranscription(true)
    onAction('scroll')
  }

  const pause = () => {
    const elapsed = startTime ? Date.now() - startTime : 0
    setRemainingTime(prev => prev - elapsed)
    pauseRecording()
  }

  const resume = () => {
    resumeRecording()
    setStartTime(Date.now())
  }


  const renderControls = () => {
    if (status === 'idle') {
      return (
        <Button onClick={start} size="small" icon={<Icon style={{ fontSize: 20 }} component={StartIcon} />}>
          Start Recording
        </Button>
      )
    }

    if (status === 'paused') {
      return (
        <Space size={24}>
          <Button onClick={resume} size="small" icon={<Icon style={{ fontSize: 20 }} component={StartIcon} />}>
            Resume
          </Button>
          <Button
            type="primary"
            danger
            onClick={stop}
            size="small"
            icon={<Icon style={{ fontSize: 20 }} component={StopIcon} />}
          >
            Stop Recording
          </Button>
        </Space>
      )
    }

    if (status === 'stopped') {
      return (
        <Space size={24}>
          <Button onClick={start} size="small" icon={<PauseCircleOutlined style={{ color: '#ff5555' }} />}>
            Record Again
          </Button>
          {isCurrent && (
            <Button
              type="primary"
              onClick={() => onAction(num === 5 ? 'finishInterview' : 'nextQuestion')}
              size="small"
            >
              {num === 5 ? 'Finish Interview' : 'Go To Next Question'}
              <RightOutlined style={{ fontSize: 12 }} />
            </Button>
          )}
        </Space>
      )
    }

    return (
      <Space size={24}>
        <Button onClick={pause} size="small" icon={<PauseCircleOutlined />}>
          Pausee
        </Button>
        <Button
          type="primary"
          danger
          onClick={stop}
          size="small"
          icon={<Icon style={{ fontSize: 20 }} component={StopIcon} />}
        >
          Stop Recording
        </Button>
      </Space>
    )
  }

  const isRecording = status === 'recording' || status === 'paused'

  const recorder = () => (
    <Flex vertical className={styles.bubble} flex={1}>
      <Flex vertical align="center" className={styles.question}>
        <Typography.Text>Question 1</Typography.Text>
        <Typography.Title level={3} className={styles.title}>{question}</Typography.Title>
        <div className={styles.visualizer}>
          {isRecording
            ? <AudioWaveVisualizer stream={mediaStreamRef.current} style={{ height: undefined }} />
            : (
              <Flex vertical justify="center" gap={8}>
                <Icon style={{ fontSize: 60 }} component={VideoRecordIcon} className={styles.recordIcon} />
                <Typography.Text>Press Start Recording to record your answer</Typography.Text>
              </Flex>
            )}
        </div>
        <div className={styles.controls}>
          {isRecording && (
            <Flex justify="space-between" flex={1}>
              <Tag color="#0B0B0BAA" className={styles.tag}>
                <div className={styles.dot} />
                {status === 'paused' ? 'Paused' : 'Rec'}
              </Tag>
              {status === 'paused'
                ? (
                  <Typography.Text strong type="secondary" className={styles.time}>
                    {dayjs(new Date(remainingTime)).format('MM:ss')}
                  </Typography.Text>
                )
                : (
                  <Countdown
                    value={Date.now() + remainingTime}
                    className={styles.countdown}
                    format="mm:ss"
                    styles={{ content: { fontSize: 14 } }}
                  />
                )}

            </Flex>
          )}
        </div>
      </Flex>
      {showTranscription && <Transcription />}

      <div className={styles.footer}>
        {footer}
      </div>
      <Flex justify="center">
        {renderControls()}
      </Flex>
    </Flex>
  )

  if (!permissionGranted) {
    return (
      <GrantAccess
        onGrantPermission={() => setPermissionGranted(true)}
        selectedAudioDevice={selectedAudioDevice}
        setError={setError}
        setStream={setStream}
        streamRef={mediaStreamRef}
      />
    )
  }

  return recorder()
}


export const AudioRecorder = bubbleProps => (
  <ReactMediaRecorder render={props => <Recorder {...bubbleProps} {...props} />} />
)
