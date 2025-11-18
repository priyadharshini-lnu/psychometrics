import React, { useState, useEffect } from 'react'
import {
  Form, Input, Select, Button, Row, Col, Typography, Flex, message, Spin,
} from 'antd'
import { useSelector } from 'react-redux'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { AiAssistantTR, AiAssistant } from '~/modules/admin/modules/AiAssitant/core/aiAssistant'
import { getAvailableAiProviders } from '~/core/config'
import { ASSISTANT_TYPES, AI_PROVIDERS, DEPENDENCY_TYPES } from '~/modules/admin/modules/AiAssitant/core/constants'
import { useResources } from '~/hooks/useResources/useResources'
import { OutputSchemaKeyFields } from './OutputSchemaKeyFields'
import { AiAssistantRevisions } from './AiAssistantRevisions'

type Props = {
   aiAssistant?: AiAssistant
}

const { I18n } = window

const AiAssistantForm: React.FC<Props> = ({ aiAssistant }: Props) => {
  const config = {
    basePath: '/ai',
    responseType: AiAssistantTR,
  }
  const resource = useResources('assistants', config)
  const [form] = Form.useForm()

  const [listError, setListError] = useState<string>('')

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const navigate = useNavigate()

  const availableAiProviders = useSelector(getAvailableAiProviders)

  const assistantOutputSchemaKeys = Form.useWatch('assistantOutputSchemaKeysAttributes', form) || []
  const assistantType = Form.useWatch('assistantType', form)

  const handleSubmit = () => {
    form.validateFields().then(() => {
      setIsLoading(true)
      const data = form.getFieldsValue()

      let updatedAssistantOutputSchemaKeysAttributes: {
        id: number;
        key: string;
        description: string;
        keyType: string;
    }[] = []

      if (aiAssistant?.assistantOutputSchemaKeysAttributes) {
        updatedAssistantOutputSchemaKeysAttributes = aiAssistant?.assistantOutputSchemaKeysAttributes?.map((item) => {
          const existingKeys = assistantOutputSchemaKeys.filter(schKey => schKey.id)
          if (existingKeys.filter(schKey => schKey.id.toString() === item.id.toString()).length) {
            return { ...existingKeys[0] }
          }
          return { ...item, _destroy: true }
        })
      }


      if (aiAssistant?.id) {
        resource.updateResource({
          id: aiAssistant.id,
          ...data,
          assistantOutputSchemaKeysAttributes:
          [...assistantOutputSchemaKeys, ...updatedAssistantOutputSchemaKeysAttributes],
        }).then(() => {
          message.success(I18n.t('administration.ai_assistants.updated_successfully'))
          navigate('/admin/ai_assistants')
        })
        return
      }

      resource.createResource(data).then(() => {
        message.success(I18n.t('administration.ai_assistants.created_successfully'))
        navigate('/admin/ai_assistants')
      })
    }).catch((error) => {
      if (error
        && error.errorFields.find(field => field.name.includes('assistantOutputSchemaKeysAttributesValidator'))) {
        setListError(I18n.t('administration.ai_assistants.form.schema_key_unique'))
      } else {
        setListError('')
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const applyRevisionValues = (values) => {
    form.setFieldsValue(values)
  }

  const checkKeyUniqueness = () => {
    if (assistantOutputSchemaKeys.filter(key => key !== undefined).length > 1) {
      const keysSet = new Set(assistantOutputSchemaKeys.map(item => item.key))
      if (keysSet.size < assistantOutputSchemaKeys.length) {
        return Promise.reject(new Error(I18n.t('administration.ai_assistants.form.schema_key_unique')))
      }
    }
    return Promise.resolve()
  }

  if (isLoading) {
    return <Spin size="large" />
  }
  return (
    <Flex vertical style={{ padding: '24px' }}>
      <Flex gap={24}>
        <Form
          style={{ width: '70%' }}
          scrollToFirstError
          form={form}
          layout="vertical"
          className="resourceForm"
          initialValues={aiAssistant ? { ...aiAssistant } : {
            assistantType: ASSISTANT_TYPES.content_writer.id,
          }}
        >
          <Form.Item
            name="name"
            label={I18n.t('administration.ai_assistants.form.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={I18n.t('administration.ai_assistants.form.description')}
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="modelId"
            label={I18n.t('administration.ai_assistants.form.provider')}
            rules={[{ required: true }]}
          >
            <Select>
              {availableAiProviders.map(provider => (
                <Select.Option key={provider} value={provider}>
                  {AI_PROVIDERS[provider]?.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="assistantType"
            label={I18n.t('administration.ai_assistants.form.type')}
          >
            <Select>
              {Object.values(ASSISTANT_TYPES).map(type => (
                <Select.Option key={type.id} value={type.id}>
                  {type.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="systemPrompt"
            label={I18n.t('administration.ai_assistants.form.system_prompt')}
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="userPrompt"
            label={I18n.t('administration.ai_assistants.form.user_prompt')}
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          {assistantType === ASSISTANT_TYPES.content_writer.id && (
            <>
              <Form.Item
                name="dependencies"
                label={I18n.t('administration.ai_assistants.form.dependencies')}
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  filterOption={false}
                  mode="multiple"
                >
                  {Object.values(DEPENDENCY_TYPES).map(({ id, name }) => (
                    <Select.Option key={id} value={id}>{name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Typography.Title style={{ fontSize: '1.167rem' }}>
                {I18n.t('administration.ai_assistants.form.output_schema_keys')}
              </Typography.Title>
              <div style={{
                border: '1px solid #d9d9d9',
                padding: '16px',
                borderRadius: '4px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
              }}
              >
                <Form.List name="assistantOutputSchemaKeysAttributes">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ name, ...restField }, index) => (
                        <OutputSchemaKeyFields
                          remove={remove}
                          name={name}
                          index={index}
                          {...restField}
                        />
                      ))}
                      <Row>
                        <Col>
                          <Button
                            onClick={() => add()}
                            icon={<PlusOutlined />}
                          >
                            {I18n.t('administration.ai_assistants.form.add_output_schema_key')}
                          </Button>
                        </Col>
                      </Row>
                    </>
                  )}
                </Form.List>
                <Form.Item
                  name="assistantOutputSchemaKeysAttributesValidator"
                  shouldUpdate
                  rules={[{ validator: checkKeyUniqueness }]}
                  noStyle
                  dependencies={['assistantOutputSchemaKeysAttributes']}
                />
                {listError && (
                  <Typography.Text type="danger" style={{ marginTop: '8px' }}>
                    {listError}
                  </Typography.Text>
                )}
              </div>
            </>
          )}
          <Button type="primary" htmlType="submit" onClick={handleSubmit}>
            {aiAssistant?.id ? I18n.t('administration.ai_assistants.actions.edit')
              : I18n.t('administration.ai_assistants.actions.create')}
          </Button>
        </Form>
        <Flex>
          {aiAssistant?.id && (
            <Flex vertical>
              <Typography.Title level={4}>
                {I18n.t('administration.ai_assistants.revisions.title')}
              </Typography.Title>
              <AiAssistantRevisions aiAssistantId={aiAssistant?.id} onSelect={applyRevisionValues} />
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}

export default AiAssistantForm
