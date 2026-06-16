import React, {
  useState, useEffect, useRef, useCallback,
} from 'react'
import { motion } from 'motion/react'
import _ from 'lodash'
import styles from '../styles.less'
import { CaretRightFilled, PauseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { isRtl } from '~/utils/locales'

const { I18n } = window

interface PlaybackControlBarProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

const formatTime = (seconds: number): string => {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const PlaybackControlBar: React.FC<PlaybackControlBarProps> = ({
  videoRef,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  const seekToClientX = useCallback((clientX: number) => {
    if (!progressRef.current || !videoRef.current || !duration) return

    const rect = progressRef.current.getBoundingClientRect()
    const x = _.clamp(clientX - rect.left, 0, rect.width)
    const percent = isRtl(I18n.locale) ? (rect.width - x) / rect.width : x / rect.width
    const nextTime = percent * duration

    videoRef.current.currentTime = nextTime
    setCurrentTime(nextTime)
  }, [videoRef, duration])

  const updateTime = useCallback(() => {
    if (videoRef.current && !isSeeking) {
      setCurrentTime(videoRef.current.currentTime)
    }
    rafRef.current = requestAnimationFrame(updateTime)
  }, [videoRef, isSeeking])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    const onDurationChange = () => {
      if (video.duration && isFinite(video.duration)) {
        setDuration(video.duration)
      }
    }
    const onLoadedMetadata = () => {
      if (video.duration && isFinite(video.duration)) {
        setDuration(video.duration)
      }
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    video.addEventListener('durationchange', onDurationChange)
    video.addEventListener('loadedmetadata', onLoadedMetadata)

    if (video.duration && isFinite(video.duration)) {
      setDuration(video.duration)
    }

    rafRef.current = requestAnimationFrame(updateTime)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('durationchange', onDurationChange)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [videoRef, updateTime])

  useEffect(() => {
    if (!isSeeking) return undefined

    const onMouseMove = (event: MouseEvent) => {
      seekToClientX(event.clientX)
    }

    const onMouseUp = () => {
      setIsSeeking(false)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isSeeking, seekToClientX])

  const togglePlay = async () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused || video.ended) {
      const hasReachedEnd = video.duration > 0 && video.currentTime >= video.duration - 0.05
      if (video.ended || hasReachedEnd) {
        video.currentTime = 0
        setCurrentTime(0)
      }

      try {
        await video.play()
      } catch (_) {
        setIsPlaying(false)
      }
    } else {
      video.pause()
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    seekToClientX(e.clientX)
  }

  const handleSeekStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsSeeking(true)
    seekToClientX(e.clientX)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <motion.div
      className={styles.playbackWrapper}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className={styles.playbackControlBar}>
        <motion.button
          type="button"
          className={styles.playbackBtn}
          onClick={togglePlay}
          aria-label={isPlaying ? I18n.t('enduser.pause') : I18n.t('enduser.play')}
        >
          {isPlaying ? (
            <PauseOutlined style={{ fontSize: '1.5rem' }} />
          ) : (
            <CaretRightFilled style={{ fontSize: '1.5rem' }} />
          )}
        </motion.button>

        <span className={styles.playbackTime}>
          {formatTime(currentTime)}
        </span>

        <div
          className={styles.playbackSeekbarInline}
          ref={progressRef}
          onClick={handleSeek}
          onMouseDown={handleSeekStart}
        >
          <motion.div
            className={styles.playbackSeekbarFill}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
          <div className={styles.playbackSeekbarThumb} style={{ left: `${progress}%` }} />
        </div>

        <span className={styles.playbackTime}>
          {formatTime(duration)}
        </span>
      </div>
    </motion.div>
  )
}

export default PlaybackControlBar
