import React, { useState, useEffect } from 'react'
import {
  Form, Input, Select, Button, Row, Col, Typography, Flex, Spin, Popover,
  Descriptions, Switch, Tooltip, useApp, InputNumber, Collapse,
} from '@thetalententerprise/glint'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Add, InfoCircleOutlined } from '@thetalententerprise/glint/icons'
import { AiAssistantTR, AiAssistant } from '~/modules/admin/modules/AiAssitant/core/aiAssistant'
import { getAvailableAiProviders } from '~/core/config'
import { ASSISTANT_TYPES, DEPENDENCY_TYPES } from '~/modules/admin/modules/AiAssitant/core/constants'
import { useResources } from '~/hooks/useResources/useResources'
import { OutputSchemaKeyFields } from './OutputSchemaKeyFields'
import { AiAssistantRevisions } from './AiAssistantRevisions'
import { AdvancedPromptEditor } from './AdvancedPromptEditor'

type Props = {
   aiAssistant?: AiAssistant
}

const { I18n } = window

const THINKING_EFFORT_OPTIONS = [
  { value: 'none', label: I18n.t('admin.model_params_thinking_effort_none') },
  { value: 'low', label: I18n.t('admin.model_params_thinking_effort_low') },
  { value: 'medium', label: I18n.t('admin.model_params_thinking_effort_medium') },
  { value: 'high', label: I18n.t('admin.model_params_thinking_effort_high') },
]

const AiAssistantForm: React.FC<Props> = ({ aiAssistant }: Props) => {
  const config = {
    basePath: '/ai',
    responseType: AiAssistantTR,
  }
  const resource = useResources('assistants', config)
  const [form] = Form.useForm()
  const { modal, message } = useApp()

  const [listError, setListError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isAdvancedPrompt, setIsAdvancedPrompt] = useState<boolean>(false)

  const navigate = useNavigate()

  const availableAiProviders = useSelector(getAvailableAiProviders)

  const selectedModelId = Form.useWatch('modelId', form)
  const selectedProvider = availableAiProviders.find(p => p.model_id === selectedModelId)
  const originalProvider = availableAiProviders.find(p => p.model_id === aiAssistant?.modelId)
  const providerChanged = aiAssistant?.providerPreviouslyUsed && selectedModelId !== aiAssistant?.modelId

  const showTemperature = selectedProvider?.supports_temperature ?? true
  const showReasoning = !!selectedProvider?.supports_reasoning
  const showThinkingBudget = selectedProvider?.supports_thinking_budget ?? true

  const assistantOutputSchemaKeys = Form.useWatch('assistantOutputSchemaKeysAttributes', form) || []
  const assistantType = Form.useWatch('assistantType', form)

  const currentAssistantTypeConfig = Object.values(ASSISTANT_TYPES).find(type => type.id === assistantType)
  type TypeDefaults = { maxTokens?: number; temperature?: number }
  const typeDefaults: TypeDefaults = currentAssistantTypeConfig?.defaultModelParams ?? {}
  const supportedDependencies = currentAssistantTypeConfig && 'supportedDependencies' in currentAssistantTypeConfig
    ? currentAssistantTypeConfig.supportedDependencies
    : []
  const hasDependenciesSupport = supportedDependencies.length > 0

  const allowedDependencies = Object.values(DEPENDENCY_TYPES).filter(
    dep => supportedDependencies.includes(dep.id),
  )

  const submitForm = () => {
    setIsLoading(true)
    const data = {
      ...form.getFieldsValue(),
      advancedPromptingEnabled: isAdvancedPrompt,
    }

    if (aiAssistant?.id) {
      const existingKeyIdsInForm = assistantOutputSchemaKeys
        .filter(key => key.id)
        .map(key => key.id.toString())

      const removedKeys = aiAssistant.assistantOutputSchemaKeysAttributes
        ?.filter(keyInRecord => !existingKeyIdsInForm.includes(keyInRecord.id.toString()))
        .map(key => ({ ...key, _destroy: true })) || []

      resource.updateResource({
        id: aiAssistant.id,
        ...data,
        assistantOutputSchemaKeysAttributes: [
          ...assistantOutputSchemaKeys,
          ...removedKeys,
        ],
      }).then(() => {
        message.success(I18n.t('admin.updated_successfully'))
        navigate('/admin/ai_assistants')
      }).finally(() => setIsLoading(false))
      return
    }

    resource.createResource(data).then(() => {
      message.success(I18n.t('admin.created_successfully'))
      navigate('/admin/ai_assistants')
    }).catch((error) => {
      if (error?.assistantType) {
        message.error(error?.assistantType.title)
      }
    }).finally(() => setIsLoading(false))
  }

  const handleSubmit = () => {
    form.validateFields().then(() => {
      if (providerChanged) {
        modal.confirm({
          title: I18n.t('admin.provider_change_confirm_title'),
          content: I18n.t('admin.provider_previously_used_warning', {
            from: originalProvider?.name ?? aiAssistant?.modelId,
            to: selectedProvider?.name ?? selectedModelId,
          }),
          onOk: submitForm,
        })
        return
      }
      submitForm()
    }).catch((error) => {
      if (error
        && error.errorFields.find(field => field.name.includes('assistantOutputSchemaKeysAttributesValidator'))) {
        setListError(I18n.t('admin.schema_key_unique'))
      } else {
        setListError('')
      }
    })
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    // Set the advanced prompt state based on the existing aiAssistant data
    if (aiAssistant?.advancedPromptingEnabled) {
      setIsAdvancedPrompt(aiAssistant.advancedPromptingEnabled)
    }
  }, [aiAssistant])

  const applyRevisionValues = (values) => {
    form.setFieldsValue(values)
  }

  const checkKeyUniqueness = () => {
    if (assistantOutputSchemaKeys.filter(key => key !== undefined).length > 1) {
      const keysSet = new Set(assistantOutputSchemaKeys.map(item => item.key))
      if (keysSet.size < assistantOutputSchemaKeys.length) {
        return Promise.reject(new Error(I18n.t('admin.schema_key_unique')))
      }
    }
    return Promise.resolve()
  }

  const allowAdvancedPrompting = currentAssistantTypeConfig?.advancedPromptingEnabled ?? false

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
          initialValues={aiAssistant ? {
            ...aiAssistant,
            advancedPromptingEnabled: aiAssistant.advancedPromptingEnabled || false,
          } : {
            assistantType: ASSISTANT_TYPES.content_writer.id,
            advancedPromptingEnabled: false,
          }}
        >
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={I18n.t('shared.description')}
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="modelId"
            label={(
              <Row align="middle" gutter={8}>
                <Col>{I18n.t('admin.provider')}</Col>
                {selectedProvider && (
                  <Col>
                    <Popover
                      title={selectedProvider.name}
                      content={(
                        <Descriptions
                          bordered
                          size="small"
                          column={1}
                          style={{ maxWidth: 280 }}
                          items={[
                            {
                              key: 'model',
                              label: I18n.t('admin.ai_assistant_model_label'),
                              children: selectedProvider.model,
                            },
                            ...(selectedProvider.description ? [{
                              key: 'description',
                              label: I18n.t('shared.description'),
                              children: selectedProvider.description,
                            }] : []),
                            ...(selectedProvider.region ? [{
                              key: 'region',
                              label: I18n.t('admin.ai_assistant_model_region_label'),
                              children: selectedProvider.region,
                            }] : []),
                            ...(selectedProvider.provider ? [{
                              key: 'provider',
                              label: I18n.t('admin.ai_assistant_model_provider'),
                              children: selectedProvider.provider,
                            }] : []),
                            {
                              key: 'model_id',
                              label: I18n.t('admin.ai_assistant_model_id_label'),
                              children: selectedProvider.model_id,
                            },
                          ]}
                        />
            )}
                    >
                      <span><InfoCircleOutlined style={{ cursor: 'pointer' }} /></span>
                    </Popover>
                  </Col>
                )}
              </Row>
  )}
            rules={[{ required: true }]}
          >
            <Select
              options={availableAiProviders.map(provider => ({
                value: provider.model_id,
                label: provider.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="assistantType"
            label={I18n.t('shared.type')}
            tooltip={aiAssistant?.inUse ? I18n.t('admin.type_locked_tooltip') : undefined}
          >
            <Select
              disabled={aiAssistant?.inUse}
              options={Object.values(ASSISTANT_TYPES).map(type => ({
                value: type.id,
                label: type.name,
              }))}
            />
          </Form.Item>

          {/* Hidden field to track advanced prompting state */}
          <Form.Item
            name="advancedPromptingEnabled"
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="systemPrompt"
            label={(
              <Row align="middle" gutter={16}>
                <Col>
                  {I18n.t('admin.system_prompt')}
                </Col>
                <Col>
                  {
                    allowAdvancedPrompting && (
                      <Tooltip title={I18n.t('admin.advanced_mode_tooltip')}>
                        <Switch
                          size="small"
                          checked={isAdvancedPrompt}
                          onChange={(checked) => {
                            setIsAdvancedPrompt(checked)
                            form.setFieldValue('advancedPromptingEnabled', checked)
                          }}
                          checkedChildren={I18n.t('shared.advanced')}
                          unCheckedChildren={I18n.t('shared.basic')}
                        />
                      </Tooltip>
                    )
                  }
                </Col>
              </Row>
            )}
            rules={[{ required: true }]}
          >
            {isAdvancedPrompt && allowAdvancedPrompting ? (
              <AdvancedPromptEditor />
            ) : (
              <Input.TextArea rows={12} />
            )}
          </Form.Item>
          {assistantType !== ASSISTANT_TYPES.writing_assistant.id && (
            <Form.Item
              name="userPrompt"
              label={I18n.t('admin.user_prompt')}
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={6} />
            </Form.Item>
          )}
          {hasDependenciesSupport && (
            <>
              <Form.Item
                name="dependencies"
                label={I18n.t('admin.dependencies')}
                rules={[{ required: assistantType === ASSISTANT_TYPES.content_writer.id }]}
              >
                <Select
                  showSearch
                  mode="multiple"
                  placeholder={I18n.t('admin.ai_assistant_select_dependencies')}
                  options={allowedDependencies.map(({ id, name }) => ({ value: id, label: name }))}
                />
              </Form.Item>
              {assistantType === ASSISTANT_TYPES.content_writer.id && (
                <>
                  <Typography.Title style={{ fontSize: '1.167rem' }}>
                    {I18n.t('admin.output_schema_keys')}
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
                                icon={<Add />}
                              >
                                {I18n.t('admin.add_output_schema_key')}
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
            </>
          )}
          <Collapse
            style={{ marginBottom: 16 }}
            items={[{
              key: 'model-params',
              label: I18n.t('admin.model_params_title'),
              children: (
                <>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    {I18n.t('admin.model_params_description')}
                  </Typography.Text>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name={['modelParams', 'maxTokens']}
                        label={I18n.t('admin.model_params_max_tokens')}
                        tooltip={I18n.t('admin.model_params_max_tokens_tooltip')}
                      >
                        <InputNumber
                          min={1}
                          style={{ width: '100%' }}
                          placeholder={typeDefaults.maxTokens?.toString()}
                        />
                      </Form.Item>
                    </Col>
                    {showTemperature && (
                      <Col span={12}>
                        <Form.Item
                          name={['modelParams', 'temperature']}
                          label={I18n.t('admin.model_params_temperature')}
                          tooltip={I18n.t('admin.model_params_temperature_tooltip')}
                        >
                          <InputNumber
                            min={0}
                            max={2}
                            step={0.1}
                            style={{ width: '100%' }}
                            placeholder={typeDefaults.temperature?.toString()}
                          />
                        </Form.Item>
                      </Col>
                    )}
                    {showReasoning && (
                      <>
                        <Col span={12}>
                          <Form.Item
                            name={['modelParams', 'thinkingEffort']}
                            label={I18n.t('admin.model_params_thinking_effort')}
                            tooltip={I18n.t('admin.model_params_thinking_effort_tooltip')}
                          >
                            <Select
                              allowClear
                              options={THINKING_EFFORT_OPTIONS}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name={['modelParams', 'thinkingBudget']}
                            label={I18n.t('admin.model_params_thinking_budget')}
                            tooltip={showThinkingBudget
                              ? I18n.t('admin.model_params_thinking_budget_tooltip')
                              : I18n.t('admin.model_params_thinking_budget_unsupported')}
                          >
                            <InputNumber
                              min={1}
                              style={{ width: '100%' }}
                              disabled={!showThinkingBudget}
                            />
                          </Form.Item>
                        </Col>
                      </>
                    )}
                  </Row>
                </>
              ),
            }]}
          />
          <Button type="primary" htmlType="submit" onClick={handleSubmit} loading={isLoading} className="mb-16">
            {I18n.t('common.actions.save')}
          </Button>
        </Form>
        <Flex>
          {aiAssistant?.id && (
            <Flex vertical>
              <Typography.Title level={4}>
                {I18n.t('admin.revisions_title')}
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
