import React from 'react'
import { Input as AntInput, Form } from 'antd'
import styles from './styles.less'

interface Props {
  label: string
  name: string
  defaultValue?: string
  placeholder?: string
  password?: boolean
  errors?: string[]
}

export const InputField: React.FC<Props> = ({
  label, name, defaultValue, placeholder, password, errors = [],
}) => {
  const Input = password ? AntInput.Password : AntInput
  return (
    <Form.Item
      className={styles.input}
      label={label}
      hasFeedback={errors.length > 0}
      validateStatus={errors.length > 0 ? 'error' : 'success'}
      help={errors.map((error, i) => <div key={i} role="alert" className="ant-form-item-explain-error">{error}</div>)}
    >
      <Input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        status={errors.length > 0 ? 'error' : ''}
      />
    </Form.Item>
  )
}
