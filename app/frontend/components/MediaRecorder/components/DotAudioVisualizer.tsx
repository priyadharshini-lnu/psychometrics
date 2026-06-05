import React, { useEffect, useRef, useCallback } from 'react'

interface DotAudioVisualizerProps {
  stream: MediaStream | null;
  barCount?: number;
  barWidth?: number;
  barGap?: number;
  barColor?: string;
  minHeight?: number;
  maxHeight?: number;
  width?: number;
  height?: number;
  sensitivity?: number;
}

const DotAudioVisualizer: React.FC<DotAudioVisualizerProps> = ({
  stream,
  barCount = 5,
  barWidth = 3,
  barGap = 3,
  barColor = 'rgba(255, 255, 255, 0.9)',
  minHeight = 3,
  maxHeight = 18,
  width,
  height = 24,
  sensitivity = 1.2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const smoothedRef = useRef<Float32Array>(new Float32Array(barCount).fill(0))

  const computedWidth = width || (barCount * barWidth + (barCount - 1) * barGap)

  const cleanup = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (audioContextRef.current?.state === 'running') {
      audioContextRef.current.close()
    }
    analyserRef.current = null
    audioContextRef.current = null
  }, [])

  useEffect(() => {
    if (!stream || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = computedWidth * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    const audioCtx = new AudioContextClass()
    audioContextRef.current = audioCtx

    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.7
    analyserRef.current = analyser

    const source = audioCtx.createMediaStreamSource(stream)
    source.connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    // Mel-scale-inspired frequency bin mapping for perceptual accuracy
    const getBinRanges = () => {
      const ranges: [number, number][] = []
      const voiceStart = Math.floor((200 / (audioCtx.sampleRate / 2)) * bufferLength)
      const voiceEnd = Math.floor((4000 / (audioCtx.sampleRate / 2)) * bufferLength)
      const step = (voiceEnd - voiceStart) / barCount
      for (let i = 0; i < barCount; i += 1) {
        ranges.push([
          Math.floor(voiceStart + i * step),
          Math.floor(voiceStart + (i + 1) * step),
        ])
      }
      return ranges
    }

    const binRanges = getBinRanges()
    const smoothingFactor = 0.25

    const draw = () => {
      analyser.getByteFrequencyData(dataArray)
      ctx.clearRect(0, 0, computedWidth, height)

      for (let i = 0; i < barCount; i += 1) {
        const [start, end] = binRanges[i]
        let sum = 0
        let count = 0
        for (let j = start; j < end && j < bufferLength; j += 1) {
          sum += dataArray[j]
          count += 1
        }
        const avg = count > 0 ? sum / count / 255 : 0
        const target = avg * sensitivity

        // Exponential smoothing
        smoothedRef.current[i] += (target - smoothedRef.current[i]) * smoothingFactor

        const val = Math.max(0, Math.min(1, smoothedRef.current[i]))
        const barH = minHeight + val * (maxHeight - minHeight)

        const x = i * (barWidth + barGap) + 5
        const y = (height - barH) / 2

        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barH, barWidth / 2)
        ctx.fillStyle = barColor
        ctx.fill()
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return cleanup
  }, [stream, barCount, barWidth, barGap, barColor, minHeight, maxHeight, height, sensitivity, computedWidth, cleanup])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: computedWidth,
        height,
        display: 'block',
      }}
    />
  )
}

export default DotAudioVisualizer
