import React, { useEffect, useRef, useState } from 'react'
import SiriWave from 'siriwave'

interface AudioWaveVisualizerProps {
    stream: MediaStream | null;
    audioBlobUrl?: string;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
    amplitudeScale?: number;
}

const AudioWaveVisualizer: React.FC<AudioWaveVisualizerProps> = ({
  stream,
  audioBlobUrl,
  style = { height: '22px' },
  width = 200,
  height = 120,
  amplitudeScale = 20,
}) => {
  const audioWaveRef = useRef<SiriWave | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameIdRef = useRef<number | null>(null)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const audioContainerRef = useRef<HTMLDivElement>(null)

  const amplitudeThreshold = 5 // Set a threshold for "silence"

  const cleanupAudioContext = () => {
    if (audioWaveRef.current) {
      audioWaveRef.current.dispose()
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current)
    }
    if (audioContext && audioContext.state === 'running') {
      audioContext.close()
    }
  }

  useEffect(() => {
    const startVisualization = async () => {
      if (!audioContainerRef.current) {
        console.error('Invalid AudioWave container')
        return
      }

      audioWaveRef.current = new SiriWave({
        container: audioContainerRef.current,
        width,
        height,
        style: 'ios9',
      })

      try {
        if (audioBlobUrl) {
          const response = await fetch(audioBlobUrl)
          const audioData = await response.arrayBuffer()

          const AudioContextClass = window.AudioContext || window.webkitAudioContext
          const context = new AudioContextClass()
          setAudioContext(context)

          const decodedData = await context.decodeAudioData(audioData)
          const source = context.createBufferSource()
          source.buffer = decodedData
          const analyser = context.createAnalyser()
          analyser.fftSize = 256
          analyserRef.current = analyser

          source.connect(analyser)

          source.start()
          source.onended = () => {
            audioWaveRef.current?.setAmplitude(0)
            cleanupAudioContext()
          }
        } else {
          if (!stream) return

          const AudioContextClass = window.AudioContext || window.webkitAudioContext
          const context = new AudioContextClass()
          setAudioContext(context)

          const source = context.createMediaStreamSource(stream)

          const analyser = context.createAnalyser()
          analyser.fftSize = 1024
          analyserRef.current = analyser

          source.connect(analyser)
        }

        audioWaveRef.current.start()

        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const visualize = () => {
          analyserRef.current?.getByteTimeDomainData(dataArray)

          const amplitude = dataArray.reduce((max, value) => Math.max(max, value), 128) - 128
          if (amplitude > amplitudeThreshold) {
            audioWaveRef.current?.setAmplitude((amplitude / 128) * amplitudeScale)
          } else {
            audioWaveRef.current?.setAmplitude(0)
          }

          animationFrameIdRef.current = requestAnimationFrame(visualize)
        }

        visualize()
      } catch (error) {
        console.error('Error accessing media stream or audio:', error)
      }
    }

    startVisualization()

    return () => {
      cleanupAudioContext()
    }
  }, [stream, audioBlobUrl])

  return <div ref={audioContainerRef} style={style} />
}

export default AudioWaveVisualizer
