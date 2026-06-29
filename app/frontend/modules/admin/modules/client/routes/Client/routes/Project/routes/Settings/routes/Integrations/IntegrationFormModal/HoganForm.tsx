import React, { useEffect } from 'react'
import { Form, Select } from 'antd'
import { Integration } from '~/modules/admin/modules/client/core/integrations'

const { Option } = Select
const { I18n } = window

export const hoganProviders = ['phoenix', 'mercer'] as const

type HoganProvider = typeof hoganProviders[number]

type HoganIntegrationDetails = {
  provider: HoganProvider
}

type IntegrationType = Integration & {
  hoganIntegrationDetails?: HoganIntegrationDetails
}

type OwnProps = {
  integration?: IntegrationType
}

export const HoganForm: React.FC<OwnProps> = ({ integration }) => {
  const form = Form.useFormInstance()

  useEffect(() => {
    if (integration?.hoganIntegrationDetails) {
      form.setFieldsValue({
        provider: integration.hoganIntegrationDetails.provider,
      })
    }
  }, [integration, form])

  return (
    <>
      <Form.Item
        name="provider"
        label={I18n.t('admin.hogan_provider')}
        rules={[{
          required: true,
          message: I18n.t('admin.hogan_providerRequired'),
        }]}
      >
        <Select className="w-100">
          {hoganProviders.map(name => (
            <Option key={name} value={name}>
              {I18n.t(`admin.hogan_providers_${name}`)}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </>
  )
}
