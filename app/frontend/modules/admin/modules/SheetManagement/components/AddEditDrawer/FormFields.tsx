import { ChangeEvent, FC } from 'react'
import {
  Col, Form, Input, InputNumber, Row,
} from 'antd'

import { ColumnType } from '~/modules/admin/modules/SheetManagement/core/list'

import { MarkdownEditor } from '~/modules/admin/modules/SheetManagement/components/MarkdownEditor'
import HTMLEditor from '~/components/Editor'

const { I18n } = window

interface FieldOnChange {
  (event: ChangeEvent<HTMLInputElement>): void
  (event: ChangeEvent<HTMLTextAreaElement>): void
  (value: number): void
  (value: string): void
}
interface InputFieldProps {
  type: ColumnType
  value?: string | number
  onChange?: FieldOnChange
}

export const InputField: FC<InputFieldProps> = ({
  type,
  ...fieldItemProps
}) => {
  if (fieldItemProps.onChange === undefined) {
    return null
  }

  if (type === 'string') {
    return <Input {...fieldItemProps} />
  }

  if (type === 'text') {
    return (
      <Input.TextArea
        autoSize={{ minRows: 6, maxRows: 6 }}
        {...fieldItemProps}
      />
    )
  }

  if (type === 'number') {
    return (
      <InputNumber
        className="w-100"
        value={fieldItemProps.value}
        onChange={fieldItemProps.onChange}
      />
    )
  }

  if (type === 'markdown') {
    return (
      <MarkdownEditor
        value={fieldItemProps.value as string}
        onChange={fieldItemProps.onChange}
      />
    )
  }

  if (type === 'html') {
    return (
      <HTMLEditor
        content={fieldItemProps.value}
        handleContentChange={fieldItemProps.onChange}
      />
    )
  }

  return null
}

interface EmailFieldProps {
  isInAddMode: boolean
  email: string
}

export const EmailField: FC<EmailFieldProps> = ({
  isInAddMode,
  email,
  ...restProps
}) => {
  if (isInAddMode) {
    return (
      <Form.Item
        rules={[
          {
            required: true,
            message: I18n.t(
              'admin.sheets_drawers_add_edit_validations_required_email',
            ),
          },
        ]}
        label="Email"
        name="Email"
      >
        <Input type="email" {...restProps} />
      </Form.Item>
    )
  }

  return (
    <Row className="mb-8">
      <Col span={24}>
        <label>{I18n.t('shared.email')}</label>
      </Col>
      <Col span={24} className="mt-2">
        {email}
      </Col>
    </Row>
  )
}
