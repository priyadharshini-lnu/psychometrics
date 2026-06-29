import {
  AIServiceSpeechRealtimeApi,
  type RealtimeClientListener,
  type RealtimeMessageResult,
  type RealtimeParameters,
  RealtimeParametersModelDomainEnum,
  RealtimeParametersStabilizePartialResultsEnum,
  RealtimeParametersPunctuationEnum,
} from '@oracle/oci-ai-speech-realtime-web'

export type OnTranscribe = (message: string) => void

export type OnTranscribeError = (message: string, details?: unknown) => void

export interface OciTranscribeConfig {
  token: string
  compartmentId: string
  region: string
  languageCode: string
}

interface TranscribeOci {
  config: OciTranscribeConfig
  onTranscribe: OnTranscribe
  onError: OnTranscribeError
  onReady?: () => void
}

let sdk: AIServiceSpeechRealtimeApi | null = null
let transcription = ''

const buildRealtimeParameters = (languageCode: string): RealtimeParameters => ({
  languageCode,
  modelDomain: RealtimeParametersModelDomainEnum.GENERIC,
  modelType: 'ORACLE',
  encoding: 'audio/raw;rate=16000',
  stabilizePartialResults: RealtimeParametersStabilizePartialResultsEnum.MEDIUM,
  finalSilenceThresholdInMs: 1000,
  partialSilenceThresholdInMs: 0,
  punctuation: RealtimeParametersPunctuationEnum.NONE,
})

const buildRealtimeEndpoint = (region: string) => {
  const baseUrl = 'wss://realtime.aiservice'
  return `${baseUrl}.${region}.oci.oraclecloud.com/ws/transcribe/stream`
}

export const stopOciTranscription = function (): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!sdk) {
      resolve()
      return
    }

    const stopTimeout = setTimeout(() => {
      try {
        sdk?.close()
      } catch {
        // ignore
      }
      sdk = null
      resolve()
    }, 2000)

    try {
      sdk.requestFinalResult()

      setTimeout(() => {
        clearTimeout(stopTimeout)
        try {
          sdk?.close()
        } catch {
          // ignore
        }
        sdk = null
        resolve()
      }, 1500)
    } catch (err) {
      clearTimeout(stopTimeout)
      try {
        sdk?.close()
      } catch {
        // ignore
      }
      sdk = null
      resolve()
    }
  })
}

export const transcribeOci = ({
  config,
  onTranscribe,
  onError,
  onReady,
}: TranscribeOci) => {
  if (sdk) {
    try {
      sdk.close()
    } catch {
      // ignore
    }
    sdk = null
  }

  transcription = ''

  const listener: RealtimeClientListener = {
    onConnect: () => {
      // Connection opened
    },
    onConnectMessage: () => {
      onReady?.()
    },
    onResult: (message: RealtimeMessageResult) => {
      const transcriptionData = message.transcriptions?.[0]
      if (!transcriptionData) return

      if (transcriptionData.isFinal) {
        transcription += `${transcriptionData.transcription}\n`
        onTranscribe(transcription)
      }
    },
    onError: (error) => {
      onError('OCI transcription error', error)
      stopOciTranscription()
    },
    onClose: () => {
      // Connection closed
    },
    onAckAudio: () => {
      // Audio chunk acknowledged
    },
  }

  try {
    sdk = new AIServiceSpeechRealtimeApi(
      listener,
      config.token,
      config.compartmentId,
      buildRealtimeEndpoint(config.region),
      buildRealtimeParameters(config.languageCode),
    )

    sdk.connect()
  } catch (err) {
    onError('Failed to initialize OCI transcription', err)
    sdk = null
  }
}
