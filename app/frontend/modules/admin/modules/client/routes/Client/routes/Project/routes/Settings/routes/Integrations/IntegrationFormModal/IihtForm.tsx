import React from 'react'
import { Form, Input } from 'antd'
import { Integration } from 'modules/admin/modules/client/routes/Client/core/integrations'

const { I18n } = window

type OwneProps = {
  integration?: Integration
}
export const IihtForm: React.FC<OwneProps> = ({ integration }) => (
  <>
    <Form.Item
      name="baseApiUrl"
      label={I18n.t('administration.integrations.modal.iiht.base_api_url')}
      rules={[{ required: true }]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name="companyId"
      label={I18n.t('administration.integrations.modal.iiht.company_id')}
      rules={[{ required: true }]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name="companyName"
      label={I18n.t('administration.integrations.modal.iiht.company_name')}
      rules={[{ required: true }]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name="user"
      label={I18n.t('administration.integrations.modal.iiht.user')}
      rules={[{ required: true }]}
    >
      <Input autoComplete="off" />
    </Form.Item>

    <Form.Item
      name="password"
      label={I18n.t('administration.integrations.modal.iiht.password')}
      rules={[{ required: integration === undefined }]}
    >
      <Input.Password autoComplete="off" />
    </Form.Item>
  </>
)
