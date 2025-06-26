import React, { useEffect, useState } from 'react'
import { Form, Input } from 'antd'
import { EditOutlined, CloseOutlined } from '@ant-design/icons'

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
  const [isEditingApiKey, setIsEditingApiKey] = useState(!integration)

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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {!integration || isEditingApiKey ? (
            <>
              <Input.Password
                style={{ flex: 1 }}
                autoFocus={integration !== undefined}
              />
              {integration && (
                <CloseOutlined
                  className="cursor-pointer"
                  style={{ marginLeft: 8 }}
                  onClick={() => {
                    setIsEditingApiKey(false)
                    form.setFieldValue('apiKey', integration?.skillvueIntegrationDetails?.apiKey)
                  }}
                />
              )}
            </>
          ) : (
            <>
              <Input
                disabled
                value={integration.skillvueIntegrationDetails?.apiKey}
                style={{ flex: 1 }}
              />
              <EditOutlined
                className="cursor-pointer"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  setIsEditingApiKey(true)
                  form.setFieldValue('apiKey', '')
                }}
              />
            </>
          )}
        </div>
      </Form.Item>
    </>
  )
}
