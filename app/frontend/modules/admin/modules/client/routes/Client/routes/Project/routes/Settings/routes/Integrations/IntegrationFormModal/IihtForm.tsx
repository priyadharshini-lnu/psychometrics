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
      name="tenantId"
      label={I18n.t('administration.integrations.modal.iiht.tenant_id')}
      rules={[{ required: true }]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name="tenancyName"
      label={I18n.t('administration.integrations.modal.iiht.tenancy_name')}
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
