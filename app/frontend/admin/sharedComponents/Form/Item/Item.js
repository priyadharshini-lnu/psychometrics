import React from 'react'
import _ from 'lodash'
import { Form } from 'antd'
import Fields from './Fields'
import styles from './styles.scss'

export default function Item ({
  field: {
    label, required, name, type,
  }, field, context, layout, onChange,
}) {
  const getProps = (fieldName) => {
    const result = { help: _.get(context.errors, [fieldName, 0]) }
    if (result.help) return { ...result, validateStatus: 'error' }
    return result
  }

  const Field = Fields[type]
  return (
    <Form.Item
      {...layout}
      className={styles.container}
      label={label}
      required={required}
      colon={false}
      {...getProps(name)}
    >
      <Field field={field} context={context} onChange={onChange} />
    </Form.Item>
  )
}
