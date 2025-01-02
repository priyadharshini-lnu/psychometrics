import React, { useState, useRef, useEffect } from 'react'
import {
  Button, Col, Row, Slider, Typography,
} from 'antd'
import { CaretRightOutlined, PauseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { getMinutesAndSeconds } from '~/utils/time'
import { PLAYER_STATE } from '~/modules/survey/constants/media'

interface Props {
  playerState: string
  audioFileUrl: string
  onComplete(): void
  setPlayerElement(player: HTMLAudioElement): void
  playAudio(): void
  pauseAudioPlay(): void
}

const { I18n } = window

export const AudioPlayer: React.FC<Props> = ({
  playerState,
  audioFileUrl,
  onComplete,
  setPlayerElement,
  playAudio,
  pauseAudioPlay,
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
  }, [playerState])

  const reset = () => {
    setCurrentTime(0)
    onComplete()
  }

  const playPercentage = () => Math.round((currentTime / duration) * 100)

  const updateProgress = () => {
    hideLoadingIndicator()
    if (playerRef.current) {
      setCurrentTime(playerRef.current.currentTime)
    }
  }

  const updateDuration = () => {
    if (playerRef.current) {
      setDuration(playerRef.current.duration)
    }
  }

  const showLoadingIndicator = () => {
    setLoading(true)
  }

  const hideLoadingIndicator = () => {
    setLoading(false)
  }

  const changeCurrentTime = (percent: number) => {
    if (playerRef.current) {
      const currentTime = (percent * playerRef.current.duration) / 100
      playerRef.current.currentTime = currentTime
      setCurrentTime(currentTime)
    }
  }

  return (
    <div>
      <audio id="audioPlayer" ref={playerRef} onLoadedMetadata={updateDuration}>
        <source src={audioFileUrl} type="audio/wav" />
        Your browser does not support the audio tag.
      </audio>
      <Row align="middle" justify="center" gutter={[16, 16]}>
        <Col>
          {playerState === PLAYER_STATE.PLAYING ? (
            <Button
              shape="circle"
              loading={loading}
              icon={<PauseOutlined />}
              onClick={pauseAudioPlay}
              aria-label={I18n.t('frontend.aria.pause')}
            />
          ) : (
            <Button
              shape="circle"
              loading={loading}
              icon={<CaretRightOutlined />}
              onClick={playAudio}
              aria-label={I18n.t('frontend.aria.play')}
            />
          )}
        </Col>
        <Col>
          <Typography.Text strong>
            {getMinutesAndSeconds(currentTime)}
          </Typography.Text>
        </Col>
        <Col flex="1 0 auto">
          <Slider
            value={playPercentage()}
            onChange={changeCurrentTime}
            max={100}
            tooltip={{ open: false }}
          />
        </Col>
        <Col>
          <Typography.Text strong>
            {getMinutesAndSeconds(duration)}
          </Typography.Text>
        </Col>
      </Row>
    </div>
  )
}
