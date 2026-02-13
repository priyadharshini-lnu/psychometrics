import { includes, toLower, random } from 'lodash'

const { I18n } = window


const handleTranscriptionResults = (transcription: string, randomTextGenerated: string) => {
  const testMessage = sanitize(randomTextGenerated)
  const input = sanitize(transcription)
  return input.includes(testMessage)
}

const sanitize = (text: string) => toLower(text.replace(/[.,\s!?-@'#$%^&*]/g, ''))

const getTranscriptionMessage = (transcribeSupportedLocales) => {
  if (includes(transcribeSupportedLocales, I18n.locale)) {
    return I18n.t('enduser.system_check_test_message')
  }
  return I18n.t('enduser.system_check_test_message', { locale: 'en' })
}


function getRandomAudioTestPhrase (phrases : string[]) {
  return I18n.t(`enduser.system_check_audio_random_phrases.${phrases[random(0, phrases.length - 1)]}`)
}

function getRandomVideoTestPhrase () {
  return I18n.t('enduser.system_check_video_random_phrase')
}

export interface AudioMonitoringRefs {
  audioContextRef: React.MutableRefObject<AudioContext | null>
  analyserRef: React.MutableRefObject<AnalyserNode | null>
  audioCheckIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>
  audioDetectedRef: React.MutableRefObject<boolean>
}

export interface AudioMonitoringCallbacks {
  onAudioDetected: () => void
  onNoAudio: () => void
}

export const startAudioLevelMonitoring = (
  stream: MediaStream,
  refs: AudioMonitoringRefs,
  callbacks: AudioMonitoringCallbacks,
) => {
  try {
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const microphone = audioContext.createMediaStreamSource(stream)

    analyser.fftSize = 256
    microphone.connect(analyser)

    refs.audioContextRef.current = audioContext
    refs.analyserRef.current = analyser

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    refs.audioCheckIntervalRef.current = setInterval(() => {
      analyser.getByteFrequencyData(dataArray)

      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength

      if (average > 5) {
        refs.audioDetectedRef.current = true
        callbacks.onAudioDetected()
      } else if (!refs.audioDetectedRef.current) {
        callbacks.onNoAudio()
      }
    }, 2000)
  } catch (error) {
    console.error('Error setting up audio monitoring:', error)
  }
}

export const cleanupAudioMonitoring = (refs: AudioMonitoringRefs) => {
  if (refs.audioCheckIntervalRef.current) {
    clearInterval(refs.audioCheckIntervalRef.current)
    refs.audioCheckIntervalRef.current = null
  }
  if (refs.audioContextRef.current) {
    refs.audioContextRef.current.close()
    refs.audioContextRef.current = null
  }
}

export {
  handleTranscriptionResults, getTranscriptionMessage, getRandomAudioTestPhrase, getRandomVideoTestPhrase,
}
