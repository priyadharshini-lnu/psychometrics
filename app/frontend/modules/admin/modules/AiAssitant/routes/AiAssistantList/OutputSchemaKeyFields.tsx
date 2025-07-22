import React from 'react'
import {
  Form, Input, Select, Button, Flex, Divider, Tooltip,
} from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

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
    <Flex style={{
      marginTop: 8, minHeight: '80px', flex: 1, gap: '16px',
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
          defaultValue="string"
        >
          {['string'].map(type => (
            <Select.Option key={type} value={type}>{type}</Select.Option>
          ))}
        </Select>
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
          aria-label={I18n.t('administration.ai_assistants.form.remove_output_schema_key')}
          style={{ marginTop: '8px', alignSelf: 'center', border: '1px solid' }}
          size="middle"
          onClick={() => {
            remove(index)
          }}
          danger
          type="link"
          shape="circle"
          icon={<DeleteOutlined />}
        />
      </Tooltip>

    </Flex>
    <Divider style={{ marginBottom: 16, marginTop: 0 }} />
  </>
)
