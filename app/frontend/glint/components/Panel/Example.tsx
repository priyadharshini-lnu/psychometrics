import React from 'react'
import {
  DatePicker, Form, Input, Select, Space,
} from 'antd'
import { Panel } from './Panel'

const fieldLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
}

export const Example: React.FC = () => (
  <Space direction="vertical" size="large" style={{ display: 'flex' }}>
    <Panel
      title="Basic Information"
      /* eslint-disable max-len */
      description="Please enter the schedule information below. You can also select multiple dates to create multiple assessment centers."
    >
      <Form.Item label="Date" {...fieldLayout}>
        <DatePicker />
      </Form.Item>
    </Panel>

    <Panel
      title="27th April 2023"
      collapsible
      additionalDetails={[
        { label: 'Add timezone', value: '(GMT +04:00) Asia/Muscat' },
        { label: 'Duration', value: '4 Hours' },
        { label: 'Time', value: '09:00am' },
        { label: 'Time', value: '09:00am' },
      ]}
    >
      <Form.Item label="Seats" {...fieldLayout} wrapperCol={{ span: '6' }}>
        <Input />
      </Form.Item>

      <Form.Item
        label="Center Managers"
        {...fieldLayout}
        wrapperCol={{ span: '14' }}
      >
        <Select placeholder="Select Center Managers" />
      </Form.Item>

      <Form.Item
        label="Assessors"
        {...fieldLayout}
        wrapperCol={{ span: '14' }}
      >
        <Select placeholder="Select Assessors" />
      </Form.Item>
    </Panel>
  </Space>
)
