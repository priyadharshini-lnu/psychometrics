import React from 'react'
import {
  Flex, Typography,
} from 'antd'
import { CountdownTimer } from '~/glint/components/CountdownTimer'
import AudioWaveVisualizer from './AudioWaveVisualizer'
import styles from '../styles.less'

interface BaseVideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  mediaUrl?: string;
  permissionGranted: boolean;
  status: string;
  onPlay: () => void;
  visualizing: boolean;
  getMediaStream: () => Promise<MediaStream | null>;
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


const { I18n } = window


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
  getMediaStream,
}) => {
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

  return (
    <Flex vertical>
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
            <p>{I18n.t('enduser.system_check_camera_preview')}</p>
          </div>
        )}
        {status === 'recording' ? (
          <Flex justify="center" align="center" className={styles.recordingIndicator}>
            <div className={styles.dot} />
            <Typography.Text className={styles.rec}>
              {I18n.t('enduser.system_check_rec_text')}
            </Typography.Text>
            {showCountdownTimer
            && <CountdownTimer onFinish={onFinish} className={styles.countdownIndicator} seconds={duration} />}
          </Flex>
        ) : null}
      </Flex>
      {visualizing && status === 'recording' ? (
        <div className={styles.audioIndicator}>
          <AudioWaveVisualizer
            getMediaStream={getMediaStream}
            audioBlobUrl={mediaUrl}
          />
        </div>
      ) : null}
    </Flex>
  )
}

export default VideoPlayer
