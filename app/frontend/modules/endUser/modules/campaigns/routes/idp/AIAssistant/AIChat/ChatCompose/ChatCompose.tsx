import { FC } from 'react'
import { Sender } from '@ant-design/x'
import { Typography, Flex } from 'antd'
import styles from './ChatCompose.less'
import { CHARACTER_LIMIT } from '../constants'

const { I18n } = window

const { audio_dictation_enabled } = window.PsyGlobalState.features

interface ChatComposeProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  disabled?: boolean
  recording?: boolean
  onRecordingChange?: (recording: boolean) => void
  startDictation?: () => void
  stopDictation?: () => void
  className?: string
}

export const ChatCompose: FC<ChatComposeProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  recording = false,
  onRecordingChange,
  startDictation,
  stopDictation,
  className,
}) => {
  const characterCount = value.length
  const isOverLimit = characterCount > CHARACTER_LIMIT
  const showWarning = characterCount >= CHARACTER_LIMIT * 0.9
  const isAudioDictationEnabled = audio_dictation_enabled || false

  const validateCharacterLimit = (text: string) => text.length <= CHARACTER_LIMIT

  const handleSubmit = (submitValue: string) => {
    if (!validateCharacterLimit(submitValue)) {
      return
    }
    onSubmit(submitValue)
  }

  const allowSpeechProps = isAudioDictationEnabled ? {
    allowSpeech: {
      recording,
      onRecordingChange: (nextRecording) => {
        onRecordingChange?.(nextRecording)
        if (nextRecording) {
          startDictation?.()
        } else {
          stopDictation?.()
        }
      },
    },
  } : {}

  return (
    <Sender
      className={className}
      placeholder={I18n.t('idp.ai.compose.placeholder')}
      value={value}
      onChange={onChange}
      disabled={disabled}
      onSubmit={handleSubmit}
      suffix={(_, info) => {
        const { SendButton, SpeechButton } = info.components
        const btnProps = {
          disabled: disabled || isOverLimit,
        }

        return (
          <Flex justify="space-between" align="center" gap="small">
            {showWarning && (
              <Typography.Text className={isOverLimit ? styles.footerCounterError : styles.footerCounterWarning}>
                {`${value.length} / ${CHARACTER_LIMIT}`}
              </Typography.Text>
            )}
            <Flex gap="small">
              {isAudioDictationEnabled && <SpeechButton {...SpeechButton.defaultProps} />}
              <SendButton {...btnProps} />
            </Flex>
          </Flex>
        )
      }}
      {...allowSpeechProps}
      autoSize={{ minRows: 3, maxRows: 6 }}
    />
  )
}
