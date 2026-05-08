import React, {
  useEffect, useState, useRef,
} from 'react'
import {
  Flex, Button,
} from 'antd'
import { WarningOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useAudioLevelMonitoring } from '~/hooks/useAudioLevelMonitoring'
import styles from '../styles.less'

const { I18n } = window

interface BaseVideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  mediaUrl?: string;
  permissionGranted: boolean;
  status: string;
  visualizing: boolean;
  stream: MediaStream | null;
  controlBarOverlay?: React.ReactNode;
  maxRecordingDuration?: number;
  onPlay: () => void;
  renderControlBar: (stream: MediaStream) => React.ReactNode;
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

const RECORD_NOTE_EXIT_ANIMATION_MS = 300

const VideoRecorder: React.FC<VideoPlayerProps> = ({
  videoRef,
  mediaUrl,
  permissionGranted,
  status,
  onPlay,
  stream = null,
  renderControlBar,
  maxRecordingDuration,
}) => {
  const { startMonitoring, cleanupMonitoring, showAudioWarning } = useAudioLevelMonitoring()

  const [showRecordNote, setShowRecordNote] = useState(true)
  const [isRecordNoteClosing, setIsRecordNoteClosing] = useState(false)

  const closeRecordNote = () => {
    setIsRecordNoteClosing(true)
  }

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

  useEffect(() => {
    if (!isRecordNoteClosing) return

    const timeoutId = window.setTimeout(() => {
      setShowRecordNote(false)
    }, RECORD_NOTE_EXIT_ANIMATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isRecordNoteClosing])

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
    <Flex vertical className={styles.videoPlayerContainer}>
      <Flex className={styles.videoContainer}>
        <video
          ref={videoRef}
          autoPlay={!mediaUrl}
          playsInline
          muted={!mediaUrl}
          controls={false}
          className={styles.video}
          onPlay={onPlay}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={() => {
            if (mediaUrl && videoRef.current) {
              if (videoRef.current.paused) videoRef.current.play()
              else videoRef.current.pause()
            }
          }}
          style={mediaUrl ? { cursor: 'pointer' } : undefined}
        />

        {permissionGranted && status === 'idle' && showRecordNote && (
          <div
            className={`${styles.recordMessageOverlay} ${
              isRecordNoteClosing ? styles.recordMessageOverlayExit : ''
            }`}
          >
            <div className={styles.recordMessage}>
              {I18n.t('enduser.video_overlay_message')}
              <Button type="primary" onClick={closeRecordNote}>
                {I18n.t('enduser.lets_start')}
              </Button>
            </div>
          </div>
        )}
        {!permissionGranted && !mediaUrl && !showRecordNote && (
          <div className={styles.overlay}>
            <p>{I18n.t('shared.camera_preview')}</p>
          </div>
        )}

        {/* No audio warning overlay - top left */}
        {showAudioWarning && status === 'recording' && (
          <div className={styles.audioWarningOverlay}>
            <WarningOutlined style={{ fontSize: '1rem' }} />
            {I18n.t('shared.no_audio_warning')}
          </div>
        )}


        {status === 'recording' && (
          <div className={styles.dummyMessageOverlay}>
            <div className={styles.dummyMessage}>
              {I18n.t('enduser.dummy_message')}
            </div>
          </div>
        )}

        {status === 'recording' && maxRecordingDuration != null && (
          <RecordingProgressBar durationSeconds={maxRecordingDuration} />
        )}
      </Flex>

      {!showRecordNote && renderControlBar(stream!)}
    </Flex>
  )
}

const RecordingProgressBar: React.FC<{ durationSeconds: number }> = ({ durationSeconds }) => {
  const [started, setStarted] = useState(false)
  const rafRef = useRef<number>()

  useEffect(() => {
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setStarted(true)
      })
    })
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className={styles.videoProgressBar}>
      <div
        className={styles.videoProgressFill}
        style={{
          width: started ? '100%' : '0%',
          transition: started ? `width ${durationSeconds}s linear` : 'none',
        }}
      />
    </div>
  )
}

export default VideoRecorder
