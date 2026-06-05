import React, { useEffect } from 'react'
import {
  Form, Select,
} from 'antd'
import type { FormInstance } from 'antd'

const { I18n } = window

interface MicrositeFieldsProps {
  form?: FormInstance
}

export const MicrositeFields: React.FC<MicrositeFieldsProps> = ({ form }) => {
  useEffect(() => {
    if (form) {
      form.setFieldValue('provider', 'internal')
    }
  }, [form])

  return (
    <>
      <Form.Item
        name={['provider']}
        label={I18n.t('common.column.provider')}
        rules={[{ required: true }]}
      >
        <Select>
          <Select.Option value="internal">{I18n.t('reports.form.none_external')}</Select.Option>
        </Select>
      </Form.Item>
    </>
  )
}
