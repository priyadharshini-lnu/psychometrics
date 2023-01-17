import {
  createElement, Key, forwardRef, useMemo, HTMLAttributes, RefAttributes,
} from 'react'
import dompurify, { Config } from 'dompurify'
import cs from 'classnames'

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
  label: Config
  error: Config
  report: Config
}

const sanitizeConfig: SanitizeConfig = {
  default: { ADD_ATTR: ['target'] },
  adminRichText: {
    ADD_TAGS: ['iframe', 'ins', 'del', 'object'],
    ADD_ATTR: ['target', 'data'],
  },
  label: {
    ALLOWED_TAGS: ['span', 'br', 'nobr', 'small', 'strong', 'em'],
    ALLOWED_ATTR: ['dir'],
  },
  error: {
    ALLOWED_TAGS: ['span', 'br', 'nobr', 'small', 'strong', 'em'],
    ALLOWED_ATTR: ['dir'],
  },
  report: {
    ALLOWED_TAGS: ['img'],
    ALLOWED_ATTR: ['src', 'width', 'height'],
  },
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
      className: cs(className, 'fr-view'),
      key,
      ref,
      ...restProps,
    })
  },
)

export default SafeHTML
