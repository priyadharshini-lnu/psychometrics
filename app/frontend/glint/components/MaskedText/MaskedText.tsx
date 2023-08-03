import React, { useState } from 'react'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import { Typography } from 'antd'

type MaskedTextProps = {
  text: string,
  maskedTextPlaceholder?: string,
}

const { I18n } = window
export const MaskedText: React.FC<MaskedTextProps> = ({
  text, maskedTextPlaceholder = '************************************',
}) => {
  const [view, setView] = useState(false)
  const icon = view ? [
    <EyeOutlined data-testid="masked-text-view" key="copy-icon" />,
    <EyeOutlined data-testid="masked-text-hide" key="copied-icon" />,
  ] : [
    <EyeInvisibleOutlined data-testid="masked-text-view" key="copy-icon" />,
    <EyeInvisibleOutlined data-testid="masked-text-hide" key="copied-icon" />,
  ]
  const tooltips = view ? [I18n.t('common.tooltips.hide'), I18n.t('common.tooltips.hide')]
    : [I18n.t('common.tooltips.view'), I18n.t('common.tooltips.view')]
  return (
    <Typography.Text
      copyable={{
        icon,
        tooltips,
        onCopy: () => setView(!view),
      }}
    >
      <Typography.Text copyable={{
        text,
      }}
      >
        {view ? text : maskedTextPlaceholder}
      </Typography.Text>
    </Typography.Text>
  )
}
