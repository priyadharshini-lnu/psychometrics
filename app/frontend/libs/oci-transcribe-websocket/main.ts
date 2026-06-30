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

const OCI_STOP_MAX_WAIT_MS = 6000
const OCI_CLOSE_FALLBACK_MS = 5000

let sdk: AIServiceSpeechRealtimeApi | null = null
let transcription = ''
let isStopping = false
let stopResolve: (() => void) | null = null
let stopMaxTimer: NodeJS.Timeout | null = null
let stopFallbackTimer: NodeJS.Timeout | null = null

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

const clearStopTimers = () => {
  if (stopMaxTimer) {
    clearTimeout(stopMaxTimer)
    stopMaxTimer = null
  }

  if (stopFallbackTimer) {
    clearTimeout(stopFallbackTimer)
    stopFallbackTimer = null
  }
}

const resolvePendingStop = () => {
  clearStopTimers()
  if (stopResolve) {
    stopResolve()
    stopResolve = null
  }
}

const closeSdk = () => {
  clearStopTimers()

  stopFallbackTimer = setTimeout(() => {
    sdk = null
    resolvePendingStop()
  }, OCI_CLOSE_FALLBACK_MS)

  try {
    sdk?.close()
  } catch {
    // ignore
  }
  sdk = null
}

export const stopOciTranscription = function (): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!sdk) {
      resolve()
      return
    }

    isStopping = true
    stopResolve = resolve

    // Safety net to avoid waiting forever if OCI does not finish and close.
    stopMaxTimer = setTimeout(closeSdk, OCI_STOP_MAX_WAIT_MS)

    try {
      // Signal OCI to flush and emit the final transcript result.
      sdk.requestFinalResult()
    } catch {
      closeSdk()
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
  isStopping = false
  clearStopTimers()
  stopResolve = null

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

        // Once OCI confirms the final result after requestFinalResult(), close
        // the session — this is the reliable completion signal from OCI.
        if (isStopping) {
          closeSdk()
        }
      } else {
        // Publish partial speech so UI can keep the most recent phrase when
        // users stop recording immediately after speaking.
        onTranscribe(`${transcription}${transcriptionData.transcription}`)
      }
    },
    onError: (error) => {
      if (!isStopping) {
        onError('OCI transcription error', error)
      }
      stopOciTranscription()
    },
    onClose: () => {
      sdk = null
      resolvePendingStop()
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
