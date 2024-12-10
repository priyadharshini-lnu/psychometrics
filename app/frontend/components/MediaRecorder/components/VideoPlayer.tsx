import React from 'react'
import {
  Flex, Typography,
} from 'antd'
import { AudioOutlined } from '@ant-design/icons'
import AudioWaveVisualizer from './AudioWaveVisualizer'
import styles from '../styles.less'

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  mediaUrl?: string;
  permissionGranted: boolean;
  status: string;
  onPlay: () => void;
  visualizing: boolean;
  getMediaStream: () => Promise<MediaStream | null>;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoRef,
  mediaUrl,
  permissionGranted,
  status,
  onPlay,
  visualizing,
  getMediaStream,
}) => (
  <Flex className={styles.videoContainer}>
    <video
      ref={videoRef}
      autoPlay={!mediaUrl}
      playsInline
      muted={!mediaUrl}
      controls={!!mediaUrl}
      className={styles.video}
      onPlay={onPlay}
    />
    {!permissionGranted && !mediaUrl && (
    <div className={styles.overlay}>
      <p>Camera preview will appear here</p>
    </div>
    )}
    {status === 'recording' ? (
      <Flex justify="center" align="center" className={styles.recordingIndicator}>
        <div className={styles.dot} />
        <Typography.Text className={styles.rec}>
          REC
        </Typography.Text>
      </Flex>
    ) : null}
    {visualizing && status === 'recording' ? (
      <Flex justify="center" align="center" className={styles.audioIndicator}>
        <AudioOutlined />
        <AudioWaveVisualizer
          getMediaStream={getMediaStream}
          audioBlobUrl={mediaUrl}
        />
      </Flex>
    ) : null}
  </Flex>
)

export default VideoPlayer
