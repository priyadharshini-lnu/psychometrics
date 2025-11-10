import React from 'react'
import {
  Form, Select,
} from 'antd'

const { I18n } = window

export const YoodliFields: React.FC = () => (
  <>
    <Form.Item
      name={['provider']}
      label={I18n.t('common.column.provider')}
      rules={[{ required: true }]}
    >
      <Select>
        {/* <Select.Option value="yoodli">{I18n.t('reports.form.load_from_yoodli')}</Select.Option> */}
        <Select.Option value="internal">{I18n.t('reports.form.none_external')}</Select.Option>
      </Select>
    </Form.Item>
  </>
)
