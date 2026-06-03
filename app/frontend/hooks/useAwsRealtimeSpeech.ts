import {
  useEffect, useState, useCallback, useRef,
} from 'react'
import { notification as antdNotification } from 'antd'

import {
  transcribe,
  stopTranscription,
  OnTranscribe,
  OnTranscribeError,
} from '~/libs/amazon-transcribe-websocket-static'

const { I18n } = window

export interface useAwsRealtimeSpeechProps {
  value?: string
  onChange: (value: string) => void
  fetchPresignUrl(): Promise<{
    response: {
      url?: string
      token?: string
      compartmentId?: string
      region?: string
      provider?: string
    }
  }>
}

export interface useAwsRealtimeSpeechReturn {
  startDictation: (onReady?: () => void) => Promise<void>
  stopDictation: () => Promise<void>
  isConnecting: boolean
}
export const useAwsRealtimeSpeech = ({
  value = '',
  onChange,
  fetchPresignUrl,
}: useAwsRealtimeSpeechProps): useAwsRealtimeSpeechReturn => {
  const [isConnecting, setIsConnecting] = useState(false)
  const isStoppingRef = useRef(false)
  const startDictation = useCallback(async (onReady?: () => void) => {
    try {
      setIsConnecting(true)
      isStoppingRef.current = false

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      const {
        response: { url },
      } = await fetchPresignUrl()

      if (!url || url.length === 0) {
        throw new Error('no_url')
      }

      transcribe({
        url,
        stream: audioStream,
        onTranscribe: handleTranscription,
        onError: handleTranscriptionError,
      })

      onReady?.()
    } catch (err) {
      console.error('start dictation', err.name, err.message)

      if (err && err.message === 'no_url') {
        antdNotification.error({
          message: I18n.t('assessments.dictation.dictation_not_started'),
          description: I18n.t('assessments.dictation.no_dictation_url'),
        })
      } else if (err && err.name === 'NotAllowedError') {
        antdNotification.warning({
          message: I18n.t('assessments.dictation.dictation_not_started'),
          description: I18n.t('assessments.dictation.allow_browser_permision'),
        })
      } else {
        antdNotification.error({
          message: I18n.t('assessments.dictation.dictation_not_started'),
        })
      }
    } finally {
      setIsConnecting(false)
    }
  }, [fetchPresignUrl])

  const stopDictation = useCallback(async () => {
    isStoppingRef.current = true
    stopTranscription()
  }, [])

  const handleTranscription: OnTranscribe = useCallback((transcription) => {
    const initialValue = value ?? ''

    const formattedTranscription = transcription
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/\?/g, '')
      .replace(/!/g, '')
      .replace(/\r?\n|\r/g, ' ')

    const finalValue = `${initialValue} ${formattedTranscription}`.trim()

    onChange(finalValue)
  }, [value, onChange])

  const handleTranscriptionError: OnTranscribeError = useCallback((
    message,
    additionalMessage,
  ) => {
    console.error('err in speech to text', message, additionalMessage)
    if (!isStoppingRef.current) {
      antdNotification.error({
        message: I18n.t('assessments.dictation.dictation_stopped'),
        description: I18n.t('assessments.dictation.notifications.refresh_page'),
      })
    }
    stopDictation()
  }, [stopDictation])

  useEffect(() => () => {
    stopDictation()
  }, [stopDictation])

  return {
    startDictation,
    stopDictation,
    isConnecting,
  }
}
