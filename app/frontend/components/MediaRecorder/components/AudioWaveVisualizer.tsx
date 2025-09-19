import React, { useEffect, useRef, useState } from 'react'
import SiriWave from 'siriwave'

interface AudioWaveVisualizerProps {
    getMediaStream: () => Promise<MediaStream | null>;
    audioBlobUrl?: string;
    style?: React.CSSProperties;
}

const AudioWaveVisualizer: React.FC<AudioWaveVisualizerProps> = ({
  getMediaStream,
  audioBlobUrl,
  style = { height: '22px' },
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
        width: 200,
        height: 120, // Adjust height for better visibility
        style: 'ios9',
      })

      try {
        if (audioBlobUrl) {
          // Handle audio from recorded video playback
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

          // Connect the source to the analyser, but NOT to the destination (so it doesn't play audio)
          source.connect(analyser)

          // We are NOT connecting the analyser to the destination to keep it muted
          source.start()
          source.onended = () => {
            audioWaveRef.current?.setAmplitude(0) // Stop the wave when playback ends
            cleanupAudioContext() // Clean up after playback
          }
        } else {
          // Handle live preview visualization
          const stream = await getMediaStream()
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
            audioWaveRef.current?.setAmplitude((amplitude / 128) * 20)
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
  }, [getMediaStream, audioBlobUrl])

  return <div ref={audioContainerRef} style={style} />
}

export default AudioWaveVisualizer
