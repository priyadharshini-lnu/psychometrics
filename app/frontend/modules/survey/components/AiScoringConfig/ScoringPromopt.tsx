import React, { useEffect, useState } from 'react'
import { Typography, Input, GetProps } from 'antd'

const { I18n } = window

type Props = {
  title: React.ReactNode
  initialPrompt: string
  onPromptChange?: (value: string) => void
  className?: string
  disableScoring: boolean
  required?: boolean
} & Omit<GetProps<typeof Input.TextArea>, 'onChange' | 'value' | 'onBlur' | 'disabled' | 'title'>

export const ScoringPromopt: React.FC<Props> = ({
  initialPrompt, title, onPromptChange, className, disableScoring, required, ...props
}) => {
  const [promptText, setPromptText] = useState<string>(initialPrompt)

  const handlePromptChange = () => {
    onPromptChange && onPromptChange(promptText)
  }

  useEffect(() => {
    setPromptText(initialPrompt)
  }, [initialPrompt])

  return (
    <>
      <Typography.Text className={className}>{title}</Typography.Text>
      <Input.TextArea
        value={promptText}
        rows={props.rows || 3}
        onChange={e => setPromptText(e.target.value)}
        onBlur={handlePromptChange}
        disabled={disableScoring}
        {...props}
      />
      {required && !disableScoring && !promptText.trim()
        && <Typography.Text type="danger">{I18n.t('admin.this_field_is_required')}</Typography.Text>
      }
    </>
  )
}
