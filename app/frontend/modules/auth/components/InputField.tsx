import React from 'react'
import {
  Input as AntInput, Form,
} from 'antd'
import { PasswordProps } from 'antd/es/input'
import { AccessiblePasswordInput } from '~/glint'
import styles from './styles.less'

type ComponentProps = {
  label: string
  password?: boolean
  errors?: string[]
  type?: string
  labelFor?: string
}

type Prop1 = ComponentProps & PasswordProps

type Props = Prop1

export const InputField: React.FC<Props> = ({
  label, name, password, errors = [], disabled, labelFor, ...props
}) => {
  const InputTag = () => {
    if (password) {
      return AccessiblePasswordInput
    }

    return AntInput
  }

  const Input = InputTag()

  return (
    <Form.Item
      hidden={props.hidden}
      colon={false}
      className={styles.input}
      label={label}
      labelAlign="left"
      hasFeedback={errors.length > 0}
      validateStatus={errors.length > 0 ? 'error' : 'success'}
      help={errors.length
        ? errors.map((error, i) => <div key={i} role="alert" className="ant-form-item-explain-error">{error}</div>)
        : null}
      htmlFor={labelFor}
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
