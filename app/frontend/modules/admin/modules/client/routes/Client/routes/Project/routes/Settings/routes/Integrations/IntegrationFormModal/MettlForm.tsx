import React, { useEffect, useState } from 'react'
import {
  Form,
  Input,
  Select,
} from 'antd'
import { EditOutlined, CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { Option } = Select

const { I18n } = window

export const serverOptions = [
  { name: 'mettl_india', url: 'https://api.mettl.com' },
  { name: 'mettl_eu', url: 'https://api.mercermettl.eu' },
]

type MettlIntegrationDetails = {
  apiBaseUrl: string
  privateKey: string
  publicKey: string
}

type IntegrationType = {
  id: number
  name: string
  active: boolean
  mettlIntegrationDetails?: MettlIntegrationDetails
}

type OwnProps = {
  integration?: IntegrationType
}

export const MettlForm: React.FC<OwnProps> = ({ integration }) => {
  const form = Form.useFormInstance()
  const [isEditingPrivateKey, setIsEditingPrivateKey] = useState(!integration)

  useEffect(() => {
    if (integration?.mettlIntegrationDetails) {
      form.setFieldsValue({
        apiBaseUrl: integration.mettlIntegrationDetails.apiBaseUrl,
        publicKey: integration.mettlIntegrationDetails.publicKey,
        privateKey: integration.mettlIntegrationDetails.privateKey,
      })
    }
  }, [integration, form])

  return (
    <>
      <Form.Item
        name="apiBaseUrl"
        label={I18n.t('admin.mettl_apiBaseUrl')}
        rules={[{ required: true, message: I18n.t('admin.mettl_apiBaseUrlRequired') }]}
      >
        <Select className="w-100">
          {serverOptions.map(option => (
            <Option key={option.name} value={option.url}>
              {`${I18n.t(`admin.mettl_servers_${option.name}`)} (${option.url})`}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="publicKey"
        label={I18n.t('admin.mettl_publicKey')}
        rules={[{ required: true, message: I18n.t('admin.mettl_publicKeyRequired') }]}
      >
        <Input />
      </Form.Item>
      {isEditingPrivateKey ? (
        <Form.Item
          name="privateKey"
          label={I18n.t('admin.mettl_privateKey')}
          rules={[{ required: true, message: I18n.t('admin.mettl_privateKeyRequired') }]}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input.Password
              style={{ flex: 1 }}
              autoFocus={integration !== undefined}
            />
            {integration && (
              <CloseOutlined
                className="cursor-pointer"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  setIsEditingPrivateKey(false)
                  form.setFieldValue('privateKey', integration?.mettlIntegrationDetails?.privateKey)
                }}
              />
            )}
          </div>
        </Form.Item>
      ) : (
        <Form.Item
          label={I18n.t('admin.mettl_privateKey')}
          rules={[{ required: true, message: I18n.t('admin.mettl_privateKeyRequired') }]}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>

            <>
              <Input
                disabled
                value={form.getFieldValue('privateKey')}
                style={{ flex: 1 }}
              />
              <EditOutlined
                className="cursor-pointer"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  setIsEditingPrivateKey(true)
                  form.setFieldValue('privateKey', '')
                }}
              />
            </>
          </div>
        </Form.Item>
      )}

    </>
  )
}
