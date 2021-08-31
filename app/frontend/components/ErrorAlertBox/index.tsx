import React, { useEffect, useRef } from 'react'
import _ from 'lodash'
import { Alert } from 'antd'
import { scrollIntoView } from 'scroll-js'

const { Utils } = window

interface Errors {
  [key: string]: string[]
}

interface Props {
  errors: Errors | null
  className?: string
  scrollToError?: boolean
  scrollView?: Element | null
}

export const ErrorAlertBox: React.FC<Props> = ({
  errors, className, scrollToError, scrollView,
}) => {
  if (_.isEmpty(errors)) { return null }
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollToError) {
      setTimeout(() => {
        if (Utils.isElementInViewport(ref.current) || !ref.current) { return }

        scrollIntoView(ref.current, scrollView || document.body, { behavior: 'smooth' })
      }, 250)
    }
  }, [errors])

  return (
    <div ref={ref}>
      <Alert
        style={{ whiteSpace: 'pre' }}
        description={<ErrorMessage errors={errors} />}
        type="error"
        className={className || 'mtl'}
        showIcon
        message=""
      />
    </div>
  )
}

function ErrorMessage ({ errors }: { errors: Errors | null }) {
  if (!errors) { return null }

  return (
    <div>
      {_.values(errors).map(error => error.map((e, i) => <div style={{ whiteSpace: 'normal' }} key={i}>{e}</div>))}
    </div>
  )
}

export default ErrorAlertBox
