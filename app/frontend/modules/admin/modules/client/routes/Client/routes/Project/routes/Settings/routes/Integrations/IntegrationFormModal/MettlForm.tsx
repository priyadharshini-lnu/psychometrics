import React from 'react'
import { Form, Input } from 'antd'

const { I18n } = window

export const MettlForm: React.FC = () => (
  <>
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
