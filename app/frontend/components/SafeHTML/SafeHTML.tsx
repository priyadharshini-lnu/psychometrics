import {
  createElement, Key, forwardRef, useMemo, HTMLAttributes, RefAttributes,
} from 'react'
import dompurify, { Config } from 'dompurify'

type Ref = RefAttributes<HTMLDivElement | HTMLSpanElement>

interface Props extends HTMLAttributes<HTMLDivElement | HTMLSpanElement> {
  html: string | Node
  as?: 'div' | 'span'
  sanitizeConfig?: Config
  className?: string
  key?: Key
}

const SafeHTML = forwardRef<Ref, Props>(
  (
    {
      html, as = 'div', sanitizeConfig = {}, className, key, ...restProps
    },
    ref,
  ) => {
    const inputHTML = useMemo(() => dompurify.sanitize(html, sanitizeConfig), [html])

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
