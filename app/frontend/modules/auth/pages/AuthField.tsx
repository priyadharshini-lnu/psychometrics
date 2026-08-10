import { FC, ReactNode } from 'react'
import { Form, Input } from '@thetalententerprise/glint'

export type AuthFieldProps = {
  id: string
  name?: string
  label: ReactNode
  type?: 'text' | 'email'
  placeholder?: string
  defaultValue?: string
  autoComplete?: string
  error?: string[]
  hint?: ReactNode
  secure?: boolean
  disabled?: boolean
}

// Form.Item carries no `name` so the native Devise <form> keeps ownership of submission.
export const AuthField: FC<AuthFieldProps> = ({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  defaultValue,
  autoComplete,
  error,
  hint,
  secure,
  disabled,
}) => {
  const hasError = Boolean(error && error.length)
  const status = hasError ? 'error' : undefined

  return (
    <Form.Item
      label={label}
      htmlFor={id}
      validateStatus={status}
      help={hasError ? error?.[0] : undefined}
      extra={hint}
    >
      {secure ? (
        <Input.Password
          id={id}
          name={name}
          size="large"
          placeholder={placeholder}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          status={status}
          disabled={disabled}
        />
      ) : (
        <Input
          id={id}
          name={name}
          size="large"
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          status={status}
          disabled={disabled}
        />
      )}
    </Form.Item>
  )
}

export default AuthField
