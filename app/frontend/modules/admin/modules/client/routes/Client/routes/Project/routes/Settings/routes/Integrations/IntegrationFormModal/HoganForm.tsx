import React from 'react'
import { Form, Select } from 'antd'
import { Integration } from '~/modules/admin/modules/client/core/integrations'

const { Option } = Select
const { I18n } = window
export const hoganProviders = ['phoenix', 'mercer']

type OwneProps = {
  integration?: Integration
}
export const HoganForm: React.FC<OwneProps> = () => (
  <>
    <Form.Item
      name="provider"
      label={I18n.t('administration.integrations.modal.hogan.provider')}
      rules={[{ required: true }]}
    >
      <Select
        className="w-100"
        onChange={() => {}}
      >
        {hoganProviders.map(
          name => (
            <Option key={name} value={name}>
              {I18n.t(`administration.integrations.modal.hogan.providers.${name}`)}
            </Option>
          ),
        )}
      </Select>
    </Form.Item>
  </>
)
