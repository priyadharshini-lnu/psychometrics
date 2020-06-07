import React, { useState, useRef, useEffect } from 'react'
import { Slider, Spin } from 'antd'
import { getMinutesAndSeconds } from 'utils/time'
import { PLAYER_STATE } from '../constants'
import styles from './AudioPlayerStyle.scss'

interface Props {
  playerState: string
  audioFileUrl: string,
  onComplete(): void,
  setPlayerElement(player: HTMLAudioElement): void
}

const AudioPlayer: React.FC<Props> = ({
  playerState, audioFileUrl, onComplete, setPlayerElement,
}) => {
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [loading, setLoading] = useState(false)
  const callbackRef = useRef({})
  const playerRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (playerRef.current) {
      setPlayerElement(playerRef.current)
    }
  }, [playerRef])

  useEffect(() => {
    callbackRef.current = {
      updateProgress,
    }
  })

  useEffect(() => {
    const player = playerRef.current
    player?.addEventListener('timeupdate', updateProgress)
    player?.addEventListener('seeking', showLoadingIndicator)
    player?.addEventListener('waiting', showLoadingIndicator)
    player?.addEventListener('seeked', hideLoadingIndicator)
    player?.addEventListener('canplay', hideLoadingIndicator)
    player?.addEventListener('ended', reset)
  }, [])

  useEffect(() => {
    if (playerState === PLAYER_STATE.PLAYING) {
      showLoadingIndicator()
    }

    if (playerState === PLAYER_STATE.PAUSED) {
      playerRef.current?.pause()
    }
  }, [playerState])

  const reset = () => {
    setCurrentTime(0)
    onComplete()
  }

  const playPercentage = () => Math.round(currentTime / duration * 100)

  const updateProgress = () => {
    hideLoadingIndicator()
    if (playerRef.current) { setCurrentTime(playerRef.current.currentTime) }
  }

  const updateDuration = () => {
    if (playerRef.current) { setDuration(playerRef.current.duration) }
  }

  const showLoadingIndicator = () => {
    setLoading(true)
  }

  const hideLoadingIndicator = () => {
    setLoading(false)
  }

  const changeCurrentTime = (percent) => {
    if (playerRef.current) {
      const currentTime = (percent * playerRef.current.duration) / 100
      playerRef.current.currentTime = currentTime
      setCurrentTime(currentTime)
    }
  }

  return (
    <div>
      <audio id="audioPlayer" ref={playerRef} onLoadedMetadata={updateDuration}>
        <source
          src={audioFileUrl}
          type="audio/wav"
        />
        Your browser does not support the audio tag.
      </audio>
      <div className={styles.playerSliderContainer}>
        <div className={styles.currentTime}>
          {loading ? <Spin /> : getMinutesAndSeconds(currentTime)}
        </div>
        <Slider
          className={styles.playerSlider}
          value={playPercentage()}
          onChange={changeCurrentTime}
          max={100}
          tooltipVisible={false}
        />
        <div className={styles.startTime}>00:00</div>
        <div className={styles.endTime}>{getMinutesAndSeconds(duration)}</div>
      </div>
    </div>
  )
}

export default AudioPlayer
