import React, { FC } from 'react'
import dompurify from 'dompurify'

interface Props {
  as: 'span' | 'div'
  shouldSanitize?: boolean
  sanitizeConfig?: Record<string, unknown>
  value: string | number
}

export const InnerHTML: FC<Props> = ({
  as = 'span',
  shouldSanitize = false,
  value,
  sanitizeConfig = {},
}) => {
  const inputValue = shouldSanitize ? dompurify.sanitize(value, sanitizeConfig) : value

  return React.createElement(as, {
    dangerouslySetInnerHTML: { __html: inputValue },
  })
}
