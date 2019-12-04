import React, { useEffect } from 'react'
import _ from 'lodash'
import { Alert } from 'antd'
import { scrollIntoView } from 'scroll-js'

export default function ErrorAlertBox ({
  errors, className, scrollToError, scrollView,
}) {
  if (_.isEmpty(errors)) { return null }
  const ref = React.createRef()

  useEffect(() => {
    if (scrollToError) {
      setTimeout(() => {
        if (Utils.isElementInViewport(ref.current)) { return }

        scrollIntoView(ref.current, scrollView || window, { behavior: 'smooth' })
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
      />
    </div>
  )
}

function ErrorMessage ({ errors }) {
  return <div>{_.values(errors).map(error => error.map((e, i) => <div key={i}>{e}</div>))}</div>
}
