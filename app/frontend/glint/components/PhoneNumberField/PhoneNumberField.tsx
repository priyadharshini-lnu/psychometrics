import React from 'react'
import { Form } from 'antd'
import PhoneInput from 'antd-phone-input'
import { PhoneNumber } from 'antd-phone-input/types'

import styles from './styles.less'

interface ValidationObject {
  valid: (arg: boolean) => boolean;
}

type ComponentProps = {
  name: string;
  label: string;
  errors?: string[];
  disabled?: boolean;
  validator?: (rule: unknown, value: ValidationObject) => Promise<void>
  handlePhoneNumberChange: (value: PhoneNumber) => void;
};

type Props = ComponentProps;

export const PhoneNumberField: React.FC<Props> = ({
  label,
  name,
  errors = [],
  validator,
  disabled,
  handlePhoneNumberChange,
  ...props
}) => (
  <Form.Item
    colon={false}
    name={name}
    className={styles.input}
    label={label}
    labelAlign="left"
    style={{ width: '100%' }}
    hasFeedback={errors.length > 0}
    rules={[{ validator }]}
    validateStatus={errors.length > 0 ? 'error' : 'success'}
    help={
        errors.length
          ? errors.map((error, i) => (
            <div key={i} role="alert" className="ant-form-item-explain-error">
              {error}
            </div>
          ))
          : null
      }
  >
    <PhoneInput
      className={styles.field}
      size="large"
      name={name}
      {...props}
      enableSearch
      onChange={handlePhoneNumberChange}
      disabled={disabled}
    />
  </Form.Item>
)
