import WaveSurfer from 'wavesurfer.js'
import React, {
  useEffect, useRef, useCallback, useState,
} from 'react'
import { createRoot } from 'react-dom/client'
import { Button } from 'antd'

import { AudioPlayerSkin } from '../interfaces'

interface PlayerProps { src: string, autoplay: boolean }

const PlayIcon = () => <span className="fa fa-play" aria-hidden="true" />
const PauseIcon = () => <span className="fa fa-pause" aria-hidden="true" />

const AudioPlayer: React.FC<PlayerProps> = ({ src, autoplay }) => {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wavesurfer = useRef<any>(null)
  const playPause = useCallback(() => {
    playing ? wavesurfer.current.pause() : wavesurfer.current.play()
    setPlaying(!playing)
  }, [playing])

  useEffect(() => {
    const ws = WaveSurfer.create({
      container: ref.current,
      backend: 'MediaElement',
      barWidth: 4,
      barRadius: 4,
      height: 64,
      waveColor: '#00B4AA',
      progressColor: '#00706A',
      normalize: true,
      responsive: true,
    })
    ws.on('ready', () => autoplay && ws.play())
    ws.on('play', () => setPlaying(true))
    ws.on('pause', () => setPlaying(false))
    ws.load(src)
    wavesurfer.current = ws
  }, [src])
  return (
    <>
      <div className="waveform" ref={ref} />
      <div className="controls">
        {playing && <Button onClick={playPause} type="primary" icon={<PauseIcon />} />}
        {!playing && <Button onClick={playPause} type="primary" icon={<PlayIcon />} />}
      </div>
    </>
  )
}

const WaveSurferSkin: AudioPlayerSkin = {
  render (el) {
    const audio = el.querySelector('audio')
    if (!audio) return
    const autoPlay = audio.getAttribute('autoplay') === 'autoplay'
    const src = audio.getAttribute('src') || ''
    const root = createRoot(el)
    root.render(<AudioPlayer src={src} autoplay={autoPlay} />)
  },
}

export default WaveSurferSkin
