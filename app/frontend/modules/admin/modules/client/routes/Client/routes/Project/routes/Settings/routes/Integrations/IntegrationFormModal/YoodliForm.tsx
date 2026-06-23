import React, { useEffect } from 'react'
import { Form, Input } from 'antd'

const { I18n } = window

type YoodliIntegrationDetails = {
  launchUrl?: string
  loginUrl?: string
  keysetUrl?: string
}

type IntegrationType = {
  id: number
  name: string
  active: boolean
  yoodliIntegrationDetails?: YoodliIntegrationDetails
}

type OwnProps = {
  integration?: IntegrationType
}

export const YoodliForm: React.FC<OwnProps> = ({ integration }) => {
  const form = Form.useFormInstance()

  useEffect(() => {
    if (integration?.yoodliIntegrationDetails) {
      const details = integration.yoodliIntegrationDetails
      form.setFieldsValue({
        launchUrl: details.launchUrl,
        loginUrl: details.loginUrl,
        keysetUrl: details.keysetUrl,
      })
    }
  }, [integration, form])

  return (
    <>
      <Form.Item
        name="launchUrl"
        label={I18n.t('admin.yoodli_launch_url')}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="loginUrl"
        label={I18n.t('admin.yoodli_login_url')}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="keysetUrl"
        label={I18n.t('admin.yoodli_keyset_url')}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
    </>
  )
}
