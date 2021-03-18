import {
  createElement, Key, forwardRef, useMemo, HTMLAttributes, RefAttributes,
} from 'react'
import dompurify, { Config } from 'dompurify'

type Ref = RefAttributes<HTMLDivElement | HTMLSpanElement>

interface Props extends HTMLAttributes<HTMLDivElement | HTMLSpanElement> {
  html: string | Node
  as?: 'div' | 'span'
  config?: keyof SanitizeConfig
  className?: string
  key?: Key
}

interface SanitizeConfig {
  default: Config
  adminRichText: Config
}

const sanitizeConfig: SanitizeConfig = {
  default: { ADD_ATTR: ['target'] },
  adminRichText: { ADD_TAGS: ['iframe'] },
}

const SafeHTML = forwardRef<Ref, Props>(
  (
    {
      html, as = 'div', config = 'default', className, key, ...restProps
    },
    ref,
  ) => {
    const inputHTML = useMemo(() => dompurify.sanitize(html, sanitizeConfig[config]), [html])

    return createElement(as, {
      dangerouslySetInnerHTML: {
        __html: inputHTML,
      },
      className,
      key,
      ref,
      ...restProps,
    })
  },
)

export default SafeHTML
