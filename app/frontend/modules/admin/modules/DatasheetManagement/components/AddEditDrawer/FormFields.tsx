import React, { FC } from 'react'
import {
  Col, Form, Input, InputNumber, Row,
} from 'antd'

import {
  ColumnType,
} from 'modules/admin/modules/DatasheetManagement/core/list'

const { I18n } = window

interface InputFieldProps {
    type: ColumnType
}

export const InputField: FC<InputFieldProps> = ({ type, ...restProps }) => {
  if (type === 'string') {
    return <Input {...restProps} />
  }
  if (type === 'numeric') {
    return <InputNumber className="w-100" {...restProps} />
  }
  if (type === 'text') {
    return <Input.TextArea autoSize={{ minRows: 6, maxRows: 6 }} {...restProps} />
  }
  if (type === 'html') {
    return <>html</>
  }
  if (type === 'markdown') {
    return <>mark</>
  }
  return null
}

interface EmailFieldProps {
    isInAddMode: boolean
    email: string
  }

export const EmailField: FC<EmailFieldProps> = ({ isInAddMode, email, ...restProps }) => {
  if (isInAddMode) {
    return (
      <Form.Item
        rules={[{
          required: true,
          message: I18n.t(
            'administration.datasheets.drawers.add_edit.validations.required_email',
          ),
        }]}
        label="Email"
        name="email"
      >
        <Input type="email" {...restProps} />
      </Form.Item>
    )
  }

  return (
    <Row className="mb-8">
      <Col span={24}>
        <label>Email</label>
      </Col>
      <Col span={24} className="mt-2">
        {email}
      </Col>
    </Row>
  )
}
