import React, { useEffect } from 'react'
import { Form, Input } from 'antd'

const { I18n } = window

type IihtIntegrationDetails = {
  tenantId?: string
  tenancyName?: string
  user?: string
  webhookUrl?: string
}

type IntegrationType = {
  id: number
  name: string
  active: boolean
  iihtIntegrationDetails?: IihtIntegrationDetails
}

type OwnProps = {
  integration?: IntegrationType
}

export const IihtForm: React.FC<OwnProps> = ({ integration }) => {
  const form = Form.useFormInstance()

  useEffect(() => {
    if (integration?.iihtIntegrationDetails) {
      const details = integration.iihtIntegrationDetails
      form.setFieldsValue({
        tenantId: details.tenantId,
        tenancyName: details.tenancyName,
        user: details.user,
      })
    }
  }, [integration, form])

  return (
    <>
      <Form.Item
        name="tenantId"
        label={I18n.t('admin.iiht_tenant_id')}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="tenancyName"
        label={I18n.t('admin.iiht_tenancy_name')}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="user"
        label={I18n.t('admin.iiht_user')}
        rules={[{ required: true }]}
      >
        <Input autoComplete="off" />
      </Form.Item>

      <Form.Item
        name="password"
        label={I18n.t('admin.iiht_password')}
        rules={[{ required: integration === undefined }]}
      >
        <Input.Password autoComplete="off" />
      </Form.Item>
    </>
  )
}
