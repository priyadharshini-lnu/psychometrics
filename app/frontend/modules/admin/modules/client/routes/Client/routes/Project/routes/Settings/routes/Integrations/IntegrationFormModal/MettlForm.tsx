import React from 'react'
import { Form, Input, Select } from 'antd'

const { Option } = Select

const { I18n } = window

export const serverOptions = [
  { name: 'mettl_india', url: 'https://api.mettl.com' },
  { name: 'mettl_eu', url: 'https://api.mercermettl.eu' },
]

export const MettlForm: React.FC = () => (
  <>
    <Form.Item
      name="apiBaseUrl"
      label={I18n.t('administration.integrations.modal.mettl.apiBaseUrl')}
      rules={[{ required: true, message: I18n.t('administration.integrations.modal.mettl.apiBaseUrlRequired') }]}
    >
      <Select className="w-100">
        {serverOptions.map(option => (
          <Option key={option.name} value={option.url}>
            {`${I18n.t(`administration.integrations.modal.mettl.servers.${option.name}`)} (${option.url})`}
          </Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item
      name="publicKey"
      label={I18n.t('administration.integrations.modal.mettl.publicKey')}
      rules={[{ required: true, message: I18n.t('administration.integrations.modal.mettl.publicKeyRequired') }]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="privateKey"
      label={I18n.t('administration.integrations.modal.mettl.privateKey')}
      rules={[{ required: true, message: I18n.t('administration.integrations.modal.mettl.privateKeyRequired') }]}
    >
      <Input.Password />
    </Form.Item>
  </>
)
