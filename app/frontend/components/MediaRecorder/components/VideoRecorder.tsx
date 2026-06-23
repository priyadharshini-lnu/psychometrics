import React, {
  useEffect, useState, useRef,
} from 'react'
import {
  Flex, Button,
} from 'antd'
import { motion, useReducedMotion } from 'motion/react'
import { WarningOutlined, CaretRightFilled, PauseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useAudioLevelMonitoring } from '~/hooks/useAudioLevelMonitoring'
import styles from '../styles.less'
import DotAudioVisualizer from './DotAudioVisualizer'


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
  isTestMode?: boolean
  permissionError?: string;
  showVisualizer?: boolean;
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
  isTestMode = true,
  permissionError,
  showVisualizer = true,
}) => {
  const { startMonitoring, cleanupMonitoring, showAudioWarning } = useAudioLevelMonitoring()

  const [showRecordNote, setShowRecordNote] = useState(isTestMode)
  const [isRecordNoteClosing, setIsRecordNoteClosing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

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

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard events when video has focus and it's a playable video
      if (!mediaUrl) return

      switch (e.code) {
        case 'Space':
        case 'Enter':
          e.preventDefault()
          if (video.paused) {
            video.play()
            setIsPlaying(true)
          } else {
            video.pause()
            setIsPlaying(false)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          video.currentTime = Math.min(video.currentTime + 5, video.duration)
          break
        case 'ArrowLeft':
          e.preventDefault()
          video.currentTime = Math.max(video.currentTime - 5, 0)
          break
        default:
          break
      }
    }


    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('keydown', handleKeyDown)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('keydown', handleKeyDown)
    }
  }, [videoRef, mediaUrl])


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

  const togglePlay = () => {
    if (mediaUrl && videoRef.current) {
      if (videoRef.current.duration === videoRef.current.currentTime) {
        videoRef.current.currentTime = 0
      }
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
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
          disablePictureInPicture
          onClick={togglePlay}
          tabIndex={mediaUrl ? 0 : -1}
          aria-label={I18n.t('enduser.video_recorder_label')}
          style={mediaUrl ? { cursor: 'pointer' } : undefined}
        />
        {videoRef.current && mediaUrl && videoRef.current.currentTime < videoRef.current.duration && (
          <motion.div
            key={isPlaying ? 'pause' : 'play'}
            className={styles.videoPlayingStatusIcon}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              times: [0, 0.15, 1],
              ease: 'easeOut',
            }}
            onClick={togglePlay}
            aria-hidden="true"
          >

            {isPlaying ? (
              <PauseOutlined
                style={{
                  fontSize: '2rem',
                  color: 'white',
                }}
                aria-label={I18n.t('enduser.pause')}
              />
            ) : (
              <CaretRightFilled
                style={{
                  fontSize: '2rem',
                  color: 'white',
                }}
                aria-label={I18n.t('enduser.play')}
              />
            )}
          </motion.div>
        )}

        {permissionError ? (
          <div className={styles.errorOverlay} role="alert" aria-live="assertive">
            <span>{permissionError}</span>
          </div>
        ) : (
          <>
            {permissionGranted && status === 'idle' && showRecordNote && (
              <div
                className={`${styles.recordMessageOverlay} ${
                  isRecordNoteClosing ? styles.recordMessageOverlayExit : ''
                }`}
                role="alertdialog"
                aria-label={`${I18n.t('enduser.video_overlay_label')} ${I18n.t('enduser.dummy_message')}`}
                aria-live="polite"
                aria-modal="true"
              >
                <div className={styles.recordMessage}>
                  {I18n.t('enduser.video_overlay_message')}
                  <Button type="primary" onClick={closeRecordNote}>
                    {I18n.t('shared.lets_start')}
                  </Button>
                </div>
              </div>
            )}
            {!permissionGranted && !mediaUrl && !showRecordNote && (
              <motion.div
                className={styles.overlay}
                role="status"
                aria-live="polite"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
              >
                <p>{I18n.t('shared.camera_preview')}</p>
              </motion.div>
            )}

            {/* No audio warning overlay - top left */}
            {showAudioWarning && status === 'recording' && (
              <div
                className={styles.audioWarningOverlay}
                role="alert"
                aria-live="assertive"
                aria-label={I18n.t('shared.no_audio_warning')}
              >
                <WarningOutlined
                  style={{ fontSize: '1rem' }}
                  aria-hidden="true"
                  className="self-start mt-1"
                />
                <span>{I18n.t('shared.no_audio_warning')}</span>
              </div>
            )}

            {!showAudioWarning && status === 'recording' && showVisualizer && (
              <div className={styles.audioVisualizerOverlay} aria-hidden="true">
                <DotAudioVisualizer
                  stream={stream}
                  barCount={5}
                  barWidth={6}
                  barGap={2}
                  height={48}
                  minHeight={6}
                  maxHeight={18}
                  sensitivity={1.4}
                  width={48}
                  barColor="rgba(255, 255, 255, 0.9)"
                />
              </div>

            )}

            {isTestMode && (
              <>
                {status === 'recording' && (
                  <div
                    className={styles.dummyMessageOverlay}
                    role="status"
                    aria-live="polite"
                    aria-label={I18n.t('enduser.dummy_message')}
                  >
                    <div className={styles.dummyMessage}>
                      {I18n.t('enduser.dummy_message')}
                    </div>
                  </div>
                )}

                {status === 'recording' && maxRecordingDuration != null && (
                  <RecordingProgressBar durationSeconds={maxRecordingDuration} />
                )}
              </>
            )}
          </>
        )}

      </Flex>

      {!showRecordNote && renderControlBar(stream!)}
    </Flex>
  )
}

const RecordingProgressBar: React.FC<{ durationSeconds: number }> = ({ durationSeconds }) => {
  const [started, setStarted] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const rafRef = useRef<number>()
  const startTimeRef = useRef<number>()

  const prefersReducedMotion = useReducedMotion()
  const remainingSeconds = durationSeconds - elapsedSeconds
  const isInFinalWarning = remainingSeconds === 5

  useEffect(() => {
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setStarted(true)
        startTimeRef.current = Date.now()
      })
    })
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    if (!started) return

    const updateProgress = () => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsedSeconds(Math.min(elapsed, durationSeconds))
        if (elapsed < durationSeconds) {
          rafRef.current = requestAnimationFrame(updateProgress)
        }
      }
    }

    rafRef.current = requestAnimationFrame(updateProgress)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [started, durationSeconds])

  return (
    <>
      <div
        className={styles.videoProgressBar}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={durationSeconds}
        aria-valuenow={elapsedSeconds}
        aria-label={I18n.t('enduser.recording_progress_bar')}
        aria-live="off"
        aria-valuetext={I18n.t('enduser.recording_time_remaining', { remainingSeconds })}
      >
        <div
          className={styles.videoProgressFill}
          style={{
            width: started ? '100%' : '0%',
            transition: started && !prefersReducedMotion ? `width ${durationSeconds}s linear` : 'none',
          }}
        />
      </div>
      {isInFinalWarning && (
        <div
          role="status"
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        >
          {I18n.t('enduser.recording_time_remaining', { remainingSeconds })}
        </div>
      )}
    </>
  )
}

export default VideoRecorder
