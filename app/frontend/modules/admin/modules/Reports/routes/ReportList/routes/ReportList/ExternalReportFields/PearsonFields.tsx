import React from 'react'
import {
  Form, Select,
} from 'antd'

const { I18n } = window

export const PearsonFields: React.FC = () => (
  <>
    <Form.Item
      name={['provider']}
      label={I18n.t('common.column.provider')}
      rules={[{ required: true }]}
    >
      <Select>
        <Select.Option value="pearson">{I18n.t('reports.form.load_from_pearson')}</Select.Option>
        <Select.Option value="internal">{I18n.t('reports.form.none_external')}</Select.Option>
      </Select>
    </Form.Item>
  </>
)
