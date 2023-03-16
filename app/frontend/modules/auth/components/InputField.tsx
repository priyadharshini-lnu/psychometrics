import React from 'react'
import {
  Input as AntInput, InputNumber, Form, InputNumberProps,
} from 'antd'
import styles from './styles.less'

interface Props extends InputNumberProps {
  label: string
  name: string
  defaultValue?: string
  placeholder?: string
  password?: boolean
  errors?: string[]
  disabled?:boolean
  type?: string
}

export const InputField: React.FC<Props> = ({
  label, name, defaultValue, placeholder, password, errors = [], disabled, type, ...props
}) => {
  const InputTag = () => {
    if (password) {
      return AntInput.Password
    }
    if (type === 'number') {
      return InputNumber
    }

    return AntInput
  }

  const Input = InputTag()

  return (
    <Form.Item
      className={styles.input}
      label={label}
      hasFeedback={errors.length > 0}
      validateStatus={errors.length > 0 ? 'error' : 'success'}
      help={errors.length
        ? errors.map((error, i) => <div key={i} role="alert" className="ant-form-item-explain-error">{error}</div>)
        : null}
    >
      <Input
        className={styles.field}
        size="large"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        status={errors.length > 0 ? 'error' : ''}
        disabled={disabled}
        {...props}
      />
    </Form.Item>
  )
}
