import React from 'react'
import {
  Form, Input, Select, Button, Flex, Divider, Tooltip,
} from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { SCHEMA_KEY_TYPES } from '~/modules/admin/modules/AiAssitant/core/constants'

const { I18n } = window

type Props={
    name: number,
    index: number
    remove: (index: number | number[]) => void,
}

export const OutputSchemaKeyFields: React.FC<Props> = ({
  name, remove, index, ...restField
}) => (
  <>
    <Flex
      className="mt-4"
      gap={16}
      flex={1}
      style={{
        minHeight: '80px',
      }}
    >
      <Form.Item
        style={{ flex: 1 }}
        label={I18n.t('administration.ai_assistants.form.key')}
        {...restField}
        name={[name, 'key']}
        rules={[{
          required: true,
          message: I18n.t('administration.ai_assistants.form.schema_key_required'),
        }]}
      >
        <Input
          placeholder={I18n.t('administration.ai_assistants.form.enter_schema_key')}
        />

      </Form.Item>
      <Form.Item
        style={{ flex: 0.5 }}
        label={I18n.t('administration.ai_assistants.form.schema_key_type')}
        {...restField}
        name={[name, 'keyType']}
      >
        <Select
          filterOption={false}
          defaultValue={SCHEMA_KEY_TYPES.string.value}
          options={Object.values(SCHEMA_KEY_TYPES)}
        />
      </Form.Item>
      <Form.Item
        style={{ flex: 1 }}
        label={I18n.t('administration.ai_assistants.form.description')}
        {...restField}
        name={[name, 'description']}
        rules={[{
          required: true,
          message: I18n.t('administration.ai_assistants.form.schema_key_description_required'),
        }]}
      >
        <Input.TextArea
          rows={1}
          placeholder={I18n.t('administration.ai_assistants.form.enter_description')}
        />
      </Form.Item>
      <Tooltip title={I18n.t('administration.ai_assistants.form.remove_output_schema_key')}>
        <Button
          className="mt-4"
          aria-label={I18n.t('administration.ai_assistants.form.remove_output_schema_key')}
          style={{ alignSelf: 'center' }}
          size="middle"
          onClick={() => {
            remove(index)
          }}
          danger
          shape="circle"
          icon={<DeleteOutlined />}
        />
      </Tooltip>

    </Flex>
    <Divider style={{ marginBottom: 16, marginTop: 0 }} />
  </>
)
