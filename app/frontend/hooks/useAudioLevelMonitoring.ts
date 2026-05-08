import { useRef, useState, useCallback } from 'react'

const SILENCE_THRESHOLD = 4 // consecutive silent checks before warning (~3.2s at 800ms interval)

export const useAudioLevelMonitoring = () => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const silentCountRef = useRef<number>(0)

  const [showAudioWarning, setShowAudioWarning] = useState<boolean>(false)

  const startMonitoring = useCallback((mediaStream: MediaStream) => {
    // Cleanup any existing monitoring first
    if (audioCheckIntervalRef.current) {
      clearInterval(audioCheckIntervalRef.current)
      audioCheckIntervalRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    silentCountRef.current = 0
    setShowAudioWarning(false)

    try {
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(mediaStream)

      analyser.fftSize = 256
      microphone.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      audioCheckIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray)

        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength

        if (average > 15) {
          silentCountRef.current = 0
          setShowAudioWarning(false)
        } else {
          silentCountRef.current += 1
          if (silentCountRef.current >= SILENCE_THRESHOLD) {
            setShowAudioWarning(true)
          }
        }
      }, 800)
    } catch (error) {
      console.error('Error setting up audio monitoring:', error)
    }
  }, [])

  const cleanupMonitoring = useCallback(() => {
    if (audioCheckIntervalRef.current) {
      clearInterval(audioCheckIntervalRef.current)
      audioCheckIntervalRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setShowAudioWarning(false)
  }, [])

  return {
    startMonitoring,
    cleanupMonitoring,
    showAudioWarning,
  }
}
