import {
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { notification as antdNotification } from 'antd'
import {
  transcribeOci,
  stopOciTranscription,
  type OnTranscribe,
  type OciTranscribeConfig,
} from '~/libs/oci-transcribe-websocket/main'
import { resolveOciRealtimeLocale } from '~/utils/ociRealtimeLocale'

const { I18n } = window

type OciRealtimeSpeechStatus = 'idle' | 'connecting' | 'listening' | 'error'

interface UseOciRealtimeSpeechReturn {
  startDictation: (onReady?: () => void) => Promise<void>
  stopDictation: () => Promise<void>
  status: OciRealtimeSpeechStatus
  isConnecting: boolean
}

interface UseOciRealtimeSpeechOptions {
  value?: string
  onChange: (value: string) => void
  locale?: string
  fetchPresignUrl: () => Promise<{ response: OciSessionTokenResponse }>
}

interface OciSessionTokenResponse {
  token?: string
  compartmentId?: string
  sessionId?: string
  region?: string
  url?: string
}
export const useOciRealtimeSpeech = ({
  value = '',
  onChange,
  locale,
  fetchPresignUrl,
}: UseOciRealtimeSpeechOptions): UseOciRealtimeSpeechReturn => {
  const [status, setStatus] = useState<OciRealtimeSpeechStatus>('idle')
  const isStoppingRef = useRef(false)

  const getCurrentLocale = useCallback((): string => {
    if (locale) return locale
    return I18n.locale || 'en'
  }, [locale])

  const startDictation = useCallback(async (onReady?: () => void) => {
    await stopOciTranscription()

    try {
      setStatus('connecting')
      isStoppingRef.current = false // Reset flag when starting new transcription

      const { response } = await fetchPresignUrl()

      if (!response.token || !response.compartmentId || !response.region) {
        throw new Error('Invalid OCI session token response')
      }

      const currentLocale = getCurrentLocale()
      const languageCode = resolveOciRealtimeLocale(currentLocale)

      const config: OciTranscribeConfig = {
        token: response.token,
        compartmentId: response.compartmentId,
        region: response.region,
        languageCode,
      }

      const handleTranscribe: OnTranscribe = (transcription) => {
        const initialValue = value ?? ''
        const formattedTranscription = transcription.trim()
        const finalValue = `${initialValue} ${formattedTranscription}`.trim()
        onChange(finalValue)
      }

      const handleError = (message: string, details?: unknown) => {
        console.error('[OciRealtimeSpeech] Error:', message, details)

        if (!isStoppingRef.current) {
          antdNotification.error({
            message: I18n.t('assessments.dictation.dictation_stopped'),
            description: I18n.t('assessments.dictation.notifications.refresh_page'),
          })
        }

        setStatus('error')
      }

      const handleReady = () => {
        setStatus('listening')
        onReady?.()
      }

      transcribeOci({
        config,
        onTranscribe: handleTranscribe,
        onError: handleError,
        onReady: handleReady,
      })
    } catch (error) {
      console.error('[OciRealtimeSpeech] Start failed:', error)
      setStatus('error')

      antdNotification.error({
        message: I18n.t('assessments.dictation.dictation_not_started'),
        description: error instanceof Error ? error.message : 'Unknown error',
      })

      throw error
    }
  }, [getCurrentLocale, fetchPresignUrl, value, onChange])

  const stopDictation = useCallback(async (): Promise<void> => {
    isStoppingRef.current = true
    setStatus('idle')
    await stopOciTranscription()
  }, [])

  useEffect(() => () => {
    stopOciTranscription()
  }, [])

  return {
    startDictation,
    stopDictation,
    status,
    isConnecting: status === 'connecting',
  }
}
