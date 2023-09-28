import React from 'react'
import {
  Input as AntInput, Form,
} from 'antd'
import { PasswordProps } from 'antd/lib/input'
import styles from './styles.less'

type ComponentProps = {
  label: string
  password?: boolean
  errors?: string[]
  type?: string
}

type Prop1 = ComponentProps & PasswordProps

type Props = Prop1

export const InputField: React.FC<Props> = ({
  label, name, password, errors = [], disabled, ...props
}) => {
  const InputTag = () => {
    if (password) {
      return AntInput.Password
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
        status={errors.length > 0 ? 'error' : ''}
        disabled={disabled}
        {...props}
      />
    </Form.Item>
  )
}
