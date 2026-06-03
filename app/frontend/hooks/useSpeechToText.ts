import {
  useRef, useState, useCallback, type MutableRefObject,
} from 'react'
import { useDispatch } from 'react-redux'
import { useAwsRealtimeSpeech } from './useAwsRealtimeSpeech'
import { useOciRealtimeSpeech } from './useOciRealtimeSpeech'
import { AWS_SPEECH_TO_TEXT_URL } from '~/modules/survey/core/preview/FlowProcessor/consts'

export type SpeechProvider = 'aws' | 'oci'

interface PresignUrlResponse {
  response: {
    url?: string
    token?: string
    compartmentId?: string
    region?: string
    provider?: string
  }
}

export interface UseSpeechToTextProps {
  value?: string
  onChange?: (value: string) => void
}

export interface UseSpeechToTextReturn {
  startDictation: (onReady?: () => void) => Promise<void>
  stopDictation: () => Promise<void>
  isConnecting: boolean
  transcript: string
  transcriptRef: MutableRefObject<string>
}

export const useSpeechToText = ({
  value = '',
  onChange,
}: UseSpeechToTextProps = {}): UseSpeechToTextReturn => {
  const dispatch = useDispatch()
  const [provider, setProvider] = useState<SpeechProvider | null>(null)
  const [transcript, setTranscript] = useState('')
  const transcriptRef = useRef('')
  const providerResponseRef = useRef<PresignUrlResponse | null>(null)

  const handleChange = useCallback((val: string) => {
    if (onChange) {
      onChange(val)
    }
    setTranscript(val)
    transcriptRef.current = val
  }, [onChange])

  const fetchPresignUrlAndSetProvider = useCallback(async () => {
    if (providerResponseRef.current) {
      return providerResponseRef.current
    }

    const result = await dispatch({
      type: AWS_SPEECH_TO_TEXT_URL,
      request: {
        method: 'get',
        url: '/transcribe/pre_sign_url',
      },
    }) as unknown as PresignUrlResponse

    providerResponseRef.current = result

    const detectedProvider = result.response.provider as SpeechProvider | undefined
    setProvider(detectedProvider || 'aws')

    return result
  }, [dispatch])

  const aws = useAwsRealtimeSpeech({
    value,
    onChange: handleChange,
    fetchPresignUrl: fetchPresignUrlAndSetProvider,
  })

  const oci = useOciRealtimeSpeech({
    value,
    onChange: handleChange,
    fetchPresignUrl: fetchPresignUrlAndSetProvider,
  })

  const startDictation = useCallback(async (onReady?: () => void) => {
    if (!provider || !providerResponseRef.current) {
      await fetchPresignUrlAndSetProvider()
    }

    const detectedProvider = providerResponseRef.current?.response?.provider || 'aws'

    if (detectedProvider === 'oci') {
      return oci.startDictation(onReady)
    }

    return aws.startDictation(onReady)
  }, [provider, oci, aws, fetchPresignUrlAndSetProvider])

  const stopDictation = useCallback(async () => {
    const detectedProvider = providerResponseRef.current?.response?.provider || provider || 'aws'

    if (detectedProvider === 'oci') {
      return oci.stopDictation()
    }

    return aws.stopDictation()
  }, [provider, oci, aws])

  const currentProvider = providerResponseRef.current?.response?.provider || provider || 'aws'
  const isConnecting = currentProvider === 'oci' ? oci.isConnecting : aws.isConnecting

  return {
    startDictation,
    stopDictation,
    transcript,
    transcriptRef,
    isConnecting,
  }
}
