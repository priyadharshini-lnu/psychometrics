import React, { useEffect, useContext } from 'react'
import {
  Flex, Typography, Alert, Select,
} from 'antd'
import { AudioOutlined, VideoCameraOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { CountdownTimer } from '~/glint/components/CountdownTimer'
import AudioWaveVisualizer from './AudioWaveVisualizer'
import { useAudioLevelMonitoring } from '~/hooks/useAudioLevelMonitoring'
import styles from '../styles.less'
import { MediaQueryContext } from '~/glint'

const { I18n } = window

interface BaseVideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  mediaUrl?: string;
  permissionGranted: boolean;
  status: string;
  onPlay: () => void;
  visualizing: boolean;
  stream: MediaStream | null;
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  onChangeVideoDevice: (deviceId: string) => void;
  onChangeAudioDevice: (deviceId: string) => void;
}

interface VideoPlayerPropsWithCountdown extends BaseVideoPlayerProps {
  showCountdownTimer: true;
  onFinish: () => void;
  duration:number;
}

interface VideoPlayerPropsWithoutCountdown extends BaseVideoPlayerProps {
  showCountdownTimer?: false;
  onFinish?: () => void;
  duration?:number;
}

type VideoPlayerProps = VideoPlayerPropsWithCountdown | VideoPlayerPropsWithoutCountdown;

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoRef,
  mediaUrl,
  permissionGranted,
  status,
  onPlay,
  visualizing,
  showCountdownTimer = false,
  onFinish,
  duration = null,
  stream,
  videoDevices,
  audioDevices,
  onChangeVideoDevice,
  onChangeAudioDevice,
}) => {
  const { startMonitoring, cleanupMonitoring, showAudioWarning } = useAudioLevelMonitoring()
  const { isMobile } = useContext(MediaQueryContext)

  useEffect(() => {
    if (!videoRef.current) return

    if (mediaUrl) {
      videoRef.current.srcObject = null
      videoRef.current.src = mediaUrl
    } else if (stream) {
      videoRef.current.src = ''
      videoRef.current.srcObject = stream
    }
  }, [stream, mediaUrl])

  useEffect(() => {
    if (stream && status === 'recording') {
      startMonitoring(stream)
    } else {
      cleanupMonitoring()
    }
    return () => {
      cleanupMonitoring()
    }
  }, [stream, status, startMonitoring, cleanupMonitoring])

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    if (mediaUrl) {
      if (video.duration === Infinity) {
        // Fix for Chrome/MediaRecorder bug where progress starts from the end
        video.currentTime = 1e101
      } else {
        video.currentTime = 0
      }
    }
  }

  const getCameraDevices = () => {
    const items = videoDevices.map(device => ({
      value: device.deviceId,
      label: device.label || `Camera ${device.deviceId}`,
    }))
    return items
  }

  const getMicrophoneDevices = () => {
    const items = audioDevices.map(device => ({
      value: device.deviceId,
      label: device.label || `Microphone ${device.deviceId}`,
    }))
    return items
  }

  return (
    <Flex vertical className={styles.videoPlayerContainer}>
      <Flex style={{ paddingTop: '16px' }} className={styles.controls} justify="flex-end" align="flex-end">
        <AudioOutlined style={{ alignSelf: 'center' }} />
        <Select
          placeholder={(
            <p style={{ color: 'var(--ant-text-color)', margin: 0 }}>
              {I18n.t('assessments.video_response.device_selection.mic')}
            </p>
          )}
          onChange={onChangeAudioDevice}
          suffixIcon={<DownOutlined style={{ color: 'var(--ant-text-color)', pointerEvents: 'none' }} />}
          variant="borderless"
          disabled={status === 'recording'}
          styles={{
            root: { maxWidth: '40%' },
            popup: { root: { width: '300px', ...(isMobile ? { right: '-100%', width: '200px' } : {}) } },
          }}
          options={getMicrophoneDevices()}
          getPopupContainer={trigger => trigger}
        />
        <VideoCameraOutlined style={{ alignSelf: 'center' }} />
        <Select
          disabled={status === 'recording'}
          placeholder={(
            <p style={{ color: 'var(--ant-text-color)', margin: 0 }}>
              {I18n.t('assessments.video_response.device_selection.camera')}
            </p>
          )}
          styles={{
            root: { maxWidth: '40%' },
            popup: {
              root: {
                width: '300px',
                ...(isMobile ? { width: '200px' } : {}),
              },
            },
          }}
          suffixIcon={<DownOutlined style={{ color: 'var(--ant-text-color)', pointerEvents: 'none' }} />}
          onChange={onChangeVideoDevice}
          variant="borderless"
          options={getCameraDevices()}
        />
      </Flex>
      <Flex className={styles.videoContainer}>
        <video
          key={mediaUrl}
          ref={videoRef}
          autoPlay={!mediaUrl}
          playsInline
          muted={!mediaUrl}
          controls={!!mediaUrl}
          className={styles.video}
          onPlay={onPlay}
          onLoadedMetadata={handleLoadedMetadata}
        />
        {!permissionGranted && !mediaUrl && (
          <div className={styles.overlay}>
            <p>{I18n.t('shared.camera_preview')}</p>
          </div>
        )}
        {status === 'recording' ? (
          <Flex justify="center" align="center" className={styles.recordingIndicator}>
            <div className={styles.dot} />
            <Typography.Text className={styles.rec}>
              {I18n.t('shared.rec')}
            </Typography.Text>
            {showCountdownTimer
            && <CountdownTimer onFinish={onFinish} className={styles.countdownIndicator} seconds={duration} />}
          </Flex>
        ) : null}
      </Flex>
      {visualizing && status === 'recording' ? (
        <div className={styles.audioIndicator}>
          <AudioWaveVisualizer
            stream={stream}
            audioBlobUrl={mediaUrl}
          />
        </div>
      ) : null}
      {showAudioWarning && status === 'recording' && (
        <Alert
          title={I18n.t('enduser.no_audio_warning')}
          type="warning"
          className={styles.controls}
        />
      )}
    </Flex>
  )
}

export default VideoPlayer
