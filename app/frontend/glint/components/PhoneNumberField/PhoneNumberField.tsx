import {
  Button, Form, Input, InputRef, Space,
} from 'antd'
import React, { useEffect, useRef } from 'react'

import { CountrySelector, usePhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import cs from 'classnames'

import styles from './styles.less'

type Props = {
  name: string
  value: string
  label: string
  errors?: string[]
  disabled?: boolean
  onChange: (phone: string) => void
}

export const PhoneNumberField: React.FC<Props> = ({
  value,
  label,
  name,
  errors = [],
  disabled,
  onChange,
}) => {
  const phoneInput = usePhoneInput({
    value,
    onChange: (data) => {
      onChange(data.phone)
    },
  })

  const inputRef = useRef<InputRef>(null)

  // Need to reassign inputRef because antd provides not default ref
  useEffect(() => {
    if (phoneInput.inputRef && inputRef.current?.input) {
      phoneInput.inputRef.current = inputRef.current.input
    }
  }, [inputRef, phoneInput.inputRef])

  return (
    <Form.Item
      colon={false}
      name={name}
      className={styles.input}
      label={label}
      labelAlign="left"
      style={{ width: '100%' }}
      hasFeedback={errors.length > 0}
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
      <Space.Compact style={{ width: '100%' }}>
        <CountrySelector
          selectedCountry={phoneInput.country.iso2}
          onSelect={country => phoneInput.setCountry(country.iso2)}
          disabled={disabled}
          renderButtonWrapper={({ children, rootProps }) => (
            <Button
              {...rootProps}
              style={{
                padding: '4px',
                height: '100%',
                zIndex: 1, // fix focus overlap
              }}
            >
              {children}
            </Button>
          )}
          dropdownStyleProps={{
            style: {
              top: '35px',
            },
          }}
        />
        <Input
          className={cs(styles.field, styles.tel)}
          type="tel"
          value={phoneInput.inputValue}
          onChange={phoneInput.handlePhoneValueChange}
          ref={inputRef}
          name={name}
          autoComplete="tel"
          size="large"
          disabled={disabled}
        />
      </Space.Compact>
    </Form.Item>
  )
}
