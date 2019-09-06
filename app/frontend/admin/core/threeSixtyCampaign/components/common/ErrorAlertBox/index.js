import React from 'react'
import _ from 'lodash'
import { Alert } from 'antd'

export default function ErrorAlertBox ({ errors, className }) {
  if (_.isEmpty(errors)) { return null }
  return (
    <Alert
      style={{ whiteSpace: 'pre' }}
      description={<ErrorMessage errors={errors} />}
      type="error"
      className={className || 'mtl'}
      showIcon
    />
  )
}

function ErrorMessage ({ errors }) {
  return <div>{_.values(errors).map(error => error.map((e, i) => <div key={i}>{e}</div>))}</div>
}
