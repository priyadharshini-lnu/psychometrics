import { useEffect, useRef } from 'react'
import { notification as antdNotification } from 'antd'

import {
  transcribe,
  stopTranscription,
  OnTranscribe,
  OnTranscribeError,
} from '~/libs/amazon-transcribe-websocket-static'

const { I18n } = window

export interface Props {
  value?: string
  onChange: (value: string) => void
  fetchPresignUrl(): Promise<{ response: { url: string } }>
}

export const useSpeechToText = ({
  value = '',
  onChange,
  fetchPresignUrl,
}: Props) => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioAnalyzerRef = useRef<AnalyserNode | null>(null)

  const startDictation = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      const AudioContext = window.AudioContext || window.webkitAudioContext
      const audioCtx = new AudioContext()
      const audioSourceNode = audioCtx.createMediaStreamSource(audioStream)
      const audioAnalyzer = audioCtx.createAnalyser()
      audioSourceNode.connect(audioAnalyzer)
      audioAnalyzer.fftSize = 256
      audioAnalyzer.minDecibels = -90
      audioAnalyzer.maxDecibels = -10

      audioContextRef.current = audioCtx
      audioAnalyzerRef.current = audioAnalyzer

      const {
        response: { url },
      } = await fetchPresignUrl()

      if (url.length === 0) {
        throw new Error('no_url')
      }


      transcribe({
        url,
        stream: audioStream,
        onTranscribe: handleTranscription,
        onError: handleTranscriptionError,
      })
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
    }
  }

  const stopDictation = async () => {
    stopTranscription()

    await audioContextRef.current?.close()
  }

  const handleTranscription: OnTranscribe = (transcription) => {
    const initialValue = value ?? ''

    const formattedTranscription = transcription
      .toLowerCase()
      .replace('.', '')
      .replace('?', '')
      .replace('!', '')
      .replace(/\r?\n|\r/g, ' ')

    const finalValue = `${initialValue} ${formattedTranscription}`

    onChange(finalValue)
  }

  const handleTranscriptionError: OnTranscribeError = (
    message,
    additionalMessage,
  ) => {
    console.error('err in speech to text', message, additionalMessage)
    antdNotification.error({
      message: I18n.t('assessments.dictation.dictation_stopped'),
      description: I18n.t('assessments.dictation.notifications.refresh_page'),
    })
    stopDictation()
  }

  useEffect(() => () => {
    stopDictation()
  }, [])

  return { startDictation, stopDictation }
}
