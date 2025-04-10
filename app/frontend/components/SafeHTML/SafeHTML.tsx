import {
  createElement, Key, forwardRef, useMemo, HTMLAttributes, RefAttributes,
} from 'react'
import dompurify, { Config } from 'dompurify'
import cs from 'classnames'

type Ref = RefAttributes<HTMLDivElement | HTMLSpanElement>

interface Props extends HTMLAttributes<HTMLDivElement | HTMLSpanElement | HTMLLabelElement> {
  html: string | Node
  as?: 'div' | 'span' | 'label'
  config?: keyof SanitizeConfig
  className?: string
  key?: Key
  htmlFor?: string
}

interface SanitizeConfig {
  default: Config
  adminRichText: Config
  label: Config
  error: Config
  report: Config
  richTextQuestion: Config
}

const sanitizeConfig: SanitizeConfig = {
  default: { ADD_ATTR: ['target'] },
  adminRichText: {
    ADD_TAGS: ['iframe', 'ins', 'del', 'object'],
    ADD_ATTR: ['target', 'data', 'title', 'allowfullscreen', 'role'],
    ALLOW_ARIA_ATTR: true,
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
    ALLOWED_ATTR: ['src', 'width', 'height', 'style'],
  },
  // Note: Do not allow style attributes for questions for security reasons.
  // Only basic formatting will be supported.
  // If custom styles are required, we can allow class attribute and create pre-defined classes
  richTextQuestion: {
    ALLOWED_TAGS: [
      'span', 'div', 'p', 'ul', 'ol', 'li', 'b', 'strong', 'sub', 'sup', 'em',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    ],
    ALLOWED_ATTR: ['dir'],
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
