import React, { useEffect } from 'react'
import { Form, Input } from 'antd'

const { I18n } = window

type SkillvueIntegrationDetails = {
  apiKey?: string
  completionWebhookUrl?: string
  resultsWebhookUrl?: string
}

type IntegrationType = {
  id: number
  name: string
  active: boolean
  skillvueIntegrationDetails?: SkillvueIntegrationDetails
}

type OwnProps = {
  integration?: IntegrationType
}

export const SkillvueForm: React.FC<OwnProps> = ({ integration }) => {
  const form = Form.useFormInstance()

  useEffect(() => {
    if (integration?.skillvueIntegrationDetails?.apiKey) {
      form.setFieldsValue({
        apiKey: integration.skillvueIntegrationDetails.apiKey,
      })
    }
  }, [integration, form])

  return (
    <>
      <Form.Item
        name="apiKey"
        label={I18n.t('administration.integrations.modal.skillvue.apiKey')}
        rules={[{ required: true, message: I18n.t('administration.integrations.modal.skillvue.apiKeyRequired') }]}
      >
        <Input.Password />
      </Form.Item>
    </>
  )
}
