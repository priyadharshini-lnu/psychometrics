import React from 'react'
import {
  Row, Col, Form, Checkbox, Input, Select, Button,
} from 'antd'

const { Option } = Select
const { I18n } = window

export const General: React.FC = () => (
  <Row justify="space-between" className="pl">
    <Col sm={24} md={16} xl={12} xxl={10}>
      <Form
        layout="horizontal"
        labelAlign="left"
        labelCol={{
          sm: 24, md: 10, lg: 8, xl: 8,
        }}
      >
        <Form.Item name="name" label={I18n.t('administration.projects.general_settings.name_label')} required>
          <Input />
        </Form.Item>
        <Form.Item name="subdomain" label={I18n.t('administration.projects.general_settings.sub_domain_label')}>
          <Input />
        </Form.Item>
        <Form.Item
          name="projectNumber"
          label={I18n.t('administration.projects.general_settings.project_number_label')}
          required
        >
          <Input />
        </Form.Item>

        <Form.Item name="locales" label={I18n.t('administration.projects.general_settings.locales_label')}>
          <Select mode="multiple">
            <Option value="">English</Option>
            <Option value="">Arabic</Option>
            <Option value="">Deutsch</Option>
          </Select>
        </Form.Item>

        <Form.Item name="dpConsent">
          <Checkbox>{I18n.t('administration.projects.general_settings.dp_consent')}</Checkbox>
        </Form.Item>
        <Form.Item name="strongPassword">
          <Checkbox>{I18n.t('administration.projects.general_settings.password')}</Checkbox>
        </Form.Item>
        <Form.Item name="privacyLink">
          <Checkbox>{I18n.t('administration.projects.general_settings.privacy_link')}</Checkbox>
        </Form.Item>
        <Form.Item name="2fa">
          <Checkbox>{I18n.t('administration.projects.general_settings.2fa')}</Checkbox>
        </Form.Item>
        <Form.Item name="liveChat">
          <Checkbox>{I18n.t('administration.projects.general_settings.live_chat')}</Checkbox>
        </Form.Item>
        <Button type="primary" htmlType="submit" className="mb-16">
          {I18n.t('administration.projects.general_settings.save_changes')}
        </Button>
      </Form>
    </Col>
  </Row>
)
