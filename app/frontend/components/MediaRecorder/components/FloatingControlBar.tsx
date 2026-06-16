import { Button, Typography, Flex } from 'antd'
import { useContext } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  StopOutlined, VideoCameraOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import styles from '../styles.less'
import AudioDeviceControl from './AudioDeviceControl'
import CameraDeviceControl from './CameraDeviceControl'
import { MediaQueryContext } from '~/glint/components/GlintProvider/GlintProvider'

const { I18n } = window

interface FloatingControlBarProps {
  status: string;
  isRecording: boolean;
  hasMedia: boolean;
  stream: MediaStream | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDiscard: () => void;
  remainingSeconds?: number;
  maxDuration?: number;
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  onChangeVideoDevice: (deviceId: string) => void;
  onChangeAudioDevice: (deviceId: string) => void;
  selectedAudioDeviceId?: string;
  selectedVideoDeviceId?: string;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const getTimerColorClass = (remainingSeconds: number, maxDuration: number): string => {
  const remainingPercent = (remainingSeconds / maxDuration) * 100
  if (remainingPercent < 10) return styles.timerUrgent
  if (remainingPercent < 30) return styles.timerWarning
  return styles.timerNormal
}

const FloatingControlBar: React.FC<FloatingControlBarProps> = ({
  status,
  isRecording,
  hasMedia,
  onStartRecording,
  onStopRecording,
  remainingSeconds,
  maxDuration,
  audioDevices, onChangeAudioDevice,
  videoDevices = [], onChangeVideoDevice,
  selectedAudioDeviceId,
  selectedVideoDeviceId,
}) => {
  const isActiveRecording = status === 'recording'
  const showStartButton = !hasMedia && !isActiveRecording
  const showStopButton = isActiveRecording
  const showTimer = isActiveRecording && remainingSeconds != null && maxDuration != null

  const isRecordingActive = status === 'recording'

  const { isMobile } = useContext(MediaQueryContext)

  return (
    <div className={styles.floatingControlBar}>

      <AnimatePresence mode="wait" initial={false}>
        {showStartButton && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', alignItems: 'center' }}
            className={styles.recordButtonContainer}
          >
            <Button
              className={styles.recordButton}
              size="middle"
              onClick={onStartRecording}
              disabled={isRecording}
              type="primary"
              icon={<VideoCameraOutlined />}
            >
              {!isMobile && I18n.t('shared.record', { defaultValue: 'Record' })}
            </Button>
          </motion.div>
        )}

        {showStopButton && (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              alignSelf: 'flex-start',
              justifyContent: 'flex-start',
              flex: 1,
            }}
          >
            <div
              className={styles.recIndicator}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <div className={styles.dotPulsing} />
              <Typography.Text className={styles.rec}>
                {I18n.t('shared.rec')}
              </Typography.Text>
            </div>

            {showTimer && (
              <Typography.Text
                className={`${styles.inlineTimer} ${getTimerColorClass(remainingSeconds!, maxDuration!)}`}
              >
                {formatTime(maxDuration! - remainingSeconds!)}
                <span className={styles.timerSeparator}>/</span>
                {formatTime(maxDuration!)}
              </Typography.Text>
            )}
            <div className={styles.recordButtonContainer}>
              <Button
                className={styles.stopButton}
                size="middle"
                onClick={onStopRecording}
                icon={<StopOutlined />}
              >
                {!isMobile && I18n.t('enduser.stop')}
              </Button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
      {!isActiveRecording && (
        <Flex justify="end" flex={1} gap={12} wrap>
          <AudioDeviceControl
            audioDevices={audioDevices}
            selectedMicId={selectedAudioDeviceId}
            onChangeMic={onChangeAudioDevice}
            disabled={isRecordingActive}
          />
          <CameraDeviceControl
            videoDevices={videoDevices}
            selectedCameraId={selectedVideoDeviceId}
            onChangeCamera={onChangeVideoDevice}
            disabled={isRecordingActive}
          />
        </Flex>
      )}
    </div>
  )
}

export default FloatingControlBar
