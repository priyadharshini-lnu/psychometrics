import React, { useState } from 'react'
import { Form, Input } from 'antd'
import { EditOutlined, CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

type MicrositeIntegrationDetails = {
  apiKey?: string
  resultsWebhookUrl?: string
}

type IntegrationType = {
  id: number
  name: string
  active: boolean
  micrositeIntegrationDetails?: MicrositeIntegrationDetails
}

type OwnProps = {
  integration?: IntegrationType
}

export const MicrositeForm: React.FC<OwnProps> = ({ integration }) => {
  const [isEditingApiKey, setIsEditingApiKey] = useState(!integration)

  return (
    <>
      {!integration || isEditingApiKey ? (
        <Form.Item
          name="apiKey"
          label={I18n.t('administration.integrations.modal.microsite.apiKey')}
          rules={[{ required: true, message: I18n.t('administration.integrations.modal.microsite.apiKeyRequired') }]}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input.Password
              style={{ flex: 1 }}
              autoFocus={integration !== undefined}
            />
            {integration && (
              <CloseOutlined
                className="cursor-pointer ms-8"
                onClick={() => {
                  setIsEditingApiKey(false)
                }}
              />
            )}
          </div>
        </Form.Item>
      ) : (
        <Form.Item
          label={I18n.t('administration.integrations.modal.microsite.apiKey')}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input
              disabled
              value={integration.micrositeIntegrationDetails?.apiKey}
              style={{ flex: 1 }}
            />
            <EditOutlined
              className="cursor-pointer ms-8"
              onClick={() => {
                setIsEditingApiKey(true)
              }}
            />
          </div>
        </Form.Item>
      )}
    </>
  )
}
