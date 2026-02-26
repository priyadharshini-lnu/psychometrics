import { useRef, useState, useCallback } from 'react'

export const useAudioLevelMonitoring = () => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

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
          setShowAudioWarning(false)
        } else {
          setShowAudioWarning(true)
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
