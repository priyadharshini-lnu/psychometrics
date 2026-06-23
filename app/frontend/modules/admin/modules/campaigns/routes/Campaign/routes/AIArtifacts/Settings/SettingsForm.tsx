import React, {
  useCallback, useEffect, useState, useImperativeHandle, forwardRef, useMemo,
} from 'react'
import {
  Alert,
  Button,
  Card, Flex, Form, Input, message, Select, Spin, Splitter, Tooltip,
} from 'antd'
import { useParams } from 'react-router-dom'
import { debounce, isEmpty, uniqBy } from 'lodash'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { formDataToResource } from '~/libs/jsonApi/helpers'
import { slugify } from '~/utils/string'
import { useResources } from '~/hooks/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource'
import {
  ArtifactResults,
} from '~/modules/admin/modules/campaigns/routes/Campaign/routes/AIArtifacts/Results/ArtifactResults'
import { AiAssistant, AiAssistantTR } from '~/modules/admin/modules/AiAssitant/core/aiAssistant'
import { AdvancedPromptEditor } from '~/modules/admin/modules/AiAssitant/routes/AiAssistantList/AdvancedPromptEditor'
import { DEPENDENCY_LABELS } from './constants'
import {
  transformAssessmentsToQuestions,
} from './helpers'
import { AiArtifact } from '~/modules/admin/modules/campaigns/core/aiArtifacts'
import { DatasheetForm } from './DatasheetForm'
import {
  CampaignFactorsForm,
} from './CampaignFactorsForm'
import {
  AssessmentsForm,
} from './AssessmentsForm'
import { ASSISTANT_TYPES } from '~/modules/admin/modules/AiAssitant/core/constants'

type Props = {
    aiArtifact?: AiArtifact
    onClose(): void
}

// Add interface for the ref methods
export interface SettingsFormRef {
  submit: () => void
}

const { I18n } = window

export const SettingsForm = forwardRef<SettingsFormRef, Props>(({ aiArtifact, onClose }, ref) => {
  const { resource } = useResourceContext<AiArtifact>()
  const [form] = Form.useForm()
  const [codeManuallyEdited, setCodeManuallyEdited] = React.useState(false)
  const [results, setResults] = React.useState<Array<{key: string, value: string | null, type: string}> | null>(null)
  const [tokens, setTokens] = useState<{ input: number; output: number } | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [testData, setTestData] = React.useState('')
  const [isGenerating, setIsGenerating] = React.useState(false)

  // Add internal state to track current artifact data
  const [currentArtifactData, setCurrentArtifactData] = useState<AiArtifact | undefined>(aiArtifact)

  const aiAssistantId = Form.useWatch('aiAssistantId', form)
  const [isDirty, setIsDirty] = useState(false)

  const { campaignId } = useParams() as { campaignId: string }

  const {
    data: aiAssistantsData,
    fetch: fetchAiAssistants, isLoading: isAiAssistantsLoading, getResource: getAiAssistant,
  } = useResources<AiAssistant>('assistants', {
    basePath: '/ai',
    responseType: AiAssistantTR,
  })

  const {
    memberAction,
  } = useResources<AiArtifact>('ai_artifacts', {
    basePath: `campaigns/${campaignId}`,
    apiConfig: {
      camelizeOnly: [],
    },
  })

  const debouncedFetchAiAssistantsGroups = useCallback(debounce((value) => {
    fetchAiAssistants({
      apiConfig: {
        filter: { filterable_fields: value, assistant_type_eq: ASSISTANT_TYPES.content_writer.id },
      },
    })
  }, 300), [])

  const aiAssistant = useMemo(() => {
    if (aiAssistantId) {
      const selectedAssistant = getAiAssistant(aiAssistantId)
      if (selectedAssistant) {
        return selectedAssistant
      }
    }
    return currentArtifactData?.aiAssistant
  }, [aiAssistantId, getAiAssistant, currentArtifactData?.aiAssistant])


  const transformValues = (values) => {
    // Transform assessments object to questions array using standalone function
    const questions = transformAssessmentsToQuestions(values.assessments)

    const newValues = {
      ...values,
      datasheetColumns: values.includeAllDatasheetColumns ? [] : values.datasheetColumns,
      dependenciesAttributes: {
        sheetColumns: values.datasheetColumns?.map(column => ({ id: column })),
        campaignFactors: values.campaignFactors?.map(column => ({ id: column })),
        questions,
      },
      campaignId,
    }
    delete newValues.datasheetColumns
    delete newValues.campaignFactors
    delete newValues.assessments
    return newValues
  }

  const isEdit = () => (!!aiArtifact?.id)

  const aiAssistants = aiArtifact?.aiAssistant
    ? uniqBy(aiAssistantsData.concat(aiArtifact?.aiAssistant), 'id') : aiAssistantsData

  const handleClose = () => {
    setIsDirty(false)
    form.resetFields()
    setResults(null)
    setError(null)
    onClose()
  }

  const handleSubmit = () => {
    const transformed = transformValues(form.getFieldsValue())
    const resourceData = formDataToResource(transformed, 'ai_artifacts')
    if (isEdit() && aiArtifact?.id) {
      resource.updateResource({ id: aiArtifact.id, ...resourceData }).then(() => {
        handleShowSuccessMessage()
        handleClose()
      })
    } else {
      resource.createResource(resourceData).then(() => {
        handleShowSuccessMessage()
        handleClose()
      })
    }
  }

  // Expose the submit method to parent component
  useImperativeHandle(ref, () => ({
    submit: () => {
      form.submit()
    },
  }), [form])

  useEffect(() => {
    if (!isEmpty(aiArtifact)) {
      setCurrentArtifactData(aiArtifact)
      form.setFieldsValue({
        name: aiArtifact.name,
        code: aiArtifact.code,
        instructions: aiArtifact.instructions,
        aiAssistantId: aiArtifact.aiAssistant?.id,
        includeAllDatasheetColumns: aiArtifact.includeAllDatasheetColumns,
        datasheetColumns: aiArtifact.dependenciesAttributes.sheetColumns.map(c => c.id),
        campaignFactors: aiArtifact.dependenciesAttributes.campaignFactors.map(c => c.id),
      })
      setCodeManuallyEdited(true)
    } else {
      setCurrentArtifactData(undefined)
      form.resetFields()
      setCodeManuallyEdited(false)
    }
  }, [aiArtifact])

  useEffect(() => {
    if (aiAssistantId && aiAssistantId !== currentArtifactData?.aiAssistant?.id) {
      const newArtifactData = currentArtifactData ? {
        ...currentArtifactData,
        dependenciesAttributes: {
          sheetColumns: [],
          campaignFactors: [],
          questions: [],
        },
      } : undefined

      setCurrentArtifactData(newArtifactData)

      form.setFieldsValue({
        datasheetColumns: [],
        campaignFactors: [],
        assessments: {},
      })
    }
  }, [aiAssistantId, currentArtifactData])

  const handleSetCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    if (!codeManuallyEdited) {
      form.setFieldValue('code', slugify(newName))
    }
  }

  const operation = () => (isEdit() ? 'update' : 'create')
  const handleShowSuccessMessage = () => {
    let messageText = I18n.lookup(`frontend.ai_artifacts.${operation()}_success`)
    const readableResourceText = I18n.t('admin.form_title')
    messageText = messageText
            || I18n.t(`frontend.resource.${operation()}_success`, { readableResourceName: readableResourceText })
    message.success(messageText)
  }

  const handleTestGenerate = (id:string) => {
    setIsGenerating(true)
    setError(null)
    setResults(null)
    memberAction({
      id,
      action: 'test_generate',
      method: 'post',
      body: {
        test_data: testData,
      },
    }).then(({ results, total_input_tokens, total_output_tokens }:
      {results: Array<{key: string, value: string | null, type: string}>,
      total_input_tokens: number, total_output_tokens: number}) => {
      setResults(results)
      setTokens({ input: total_input_tokens, output: total_output_tokens })
    }).catch((e) => {
      setError(e.base[0].detail)
    }).finally(() => {
      setIsGenerating(false)
    })
  }

  return (
    <Splitter>
      <Splitter.Panel defaultSize="40%" min="40%" max="60%">
        <Form
          form={form}
          layout="vertical"
          style={{ padding: '2rem' }}
          initialValues={{
            ...aiArtifact,
            aiAssistantId: aiArtifact?.aiAssistant?.id,
            datasheetColumns: aiArtifact?.dependenciesAttributes.sheetColumns.map(c => c.id),
            campaignFactors: aiArtifact?.dependenciesAttributes.campaignFactors.map(c => c.id),
          }}
          onValuesChange={() => {
            if (!isDirty) setIsDirty(true)
          }}
          scrollToFirstError
          onFinish={handleSubmit}
          key={`ai_artifact_form_${aiArtifact?.id || 'new'}`}
        >
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            rules={[{ required: true }]}
          >
            <Input onChange={handleSetCode} />
          </Form.Item>
          <Form.Item
            name="code"
            label={I18n.t('shared.code')}
            rules={[{ required: true }]}
          >
            <Input onChange={() => setCodeManuallyEdited(true)} />
          </Form.Item>
          <Form.Item
            name="instructions"
            label={(
              <Flex align="center" gap={4}>
                {I18n.t('admin.instructions')}
                {aiAssistant?.advancedPromptingEnabled && (
                  <Tooltip title={I18n.t('admin.campaign_ai_artifacts_instruction_templating_tooltip')}>
                    <span><InfoCircleOutlined style={{ color: '#1890ff' }} /></span>
                  </Tooltip>
                )}
              </Flex>
            )}
            rules={[{ required: true }]}
          >
            {aiAssistant?.advancedPromptingEnabled ? (
              <AdvancedPromptEditor campaignId={campaignId} />
            ) : (
              <Input.TextArea />
            )}
          </Form.Item>
          <Form.Item
            name="aiAssistantId"
            label={I18n.t('admin.form_ai_assistant')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch={{ filterOption: false, onSearch: debouncedFetchAiAssistantsGroups }}
              loading={isAiAssistantsLoading('fetch')}
              notFoundContent={
                isAiAssistantsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')
              }
              placeholder={I18n.t('admin.form_select_ai_assistant')}
            >
              {aiAssistants.map(({ id, name }) => (
                <Select.Option key={id} value={id}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {aiAssistantId ? (
            <Form.Item>
              <Card title={I18n.t('admin.form_configuration')}>
                {(aiAssistant && aiAssistant.dependencies && aiAssistant.dependencies.length > 0) ? (
                  aiAssistant.dependencies.map((dep) => {
                    if (dep === 'assessments') {
                      return (
                        <AssessmentsForm
                          key={`ai_artifact_assessments_${currentArtifactData?.id || 'new'}_${aiAssistantId}`}
                          questions={currentArtifactData?.dependenciesAttributes.questions}
                          form={form}
                        />
                      )
                    }
                    return (
                      <Card
                        key={DEPENDENCY_LABELS[dep]}
                        type="inner"
                        className="mt-4"
                        title={DEPENDENCY_LABELS[dep]}
                      >
                        {dep === 'campaign_factors' ? <CampaignFactorsForm aiArtifact={aiArtifact} /> : null}
                        {dep === 'datasheet' ? <DatasheetForm /> : null}
                      </Card>
                    )
                  }))
                  : null
                              }
              </Card>
            </Form.Item>
          ) : null}
        </Form>
      </Splitter.Panel>
      {aiArtifact ? (
        <Splitter.Panel className="p-5" defaultSize="60%" min="40%" max="60%">
          <Flex vertical>
            <Card
              title={(
                <Flex align="center" gap={4}>
                  {I18n.t('admin.playground')}
                  <Tooltip title={I18n.t('admin.playground_info')}>
                    <span><InfoCircleOutlined /></span>
                  </Tooltip>
                </Flex>
              )}
              styles={{
                body: {
                  height: '100%',
                },
              }}
            >
              <Flex vertical gap={8}>
                <Input.TextArea
                  onChange={(e) => {
                    setTestData(e.target.value)
                  }}
                  placeholder={I18n.t('admin.playground_placeholder')}
                  rows={4}
                />
                <Button
                  style={{ alignSelf: 'flex-end' }}
                  type="primary"
                  onClick={() => handleTestGenerate(aiArtifact?.id.toString() as string)}
                  disabled={!testData || isGenerating}
                >
                  {I18n.t('admin.test_generate')}
                </Button>

                {isDirty && (
                  <Alert message={I18n.t('admin.unsaved_changes')} type="warning" />
                )}
                {isGenerating && (
                  <Flex justify="center" align="center">
                    <Spin />
                  </Flex>
                )}

                {!isGenerating && (results || error) && (
                  <Flex flex={1} style={{ maxHeight: '65%', overflowY: 'auto' }}>
                    <ArtifactResults
                      isLoading={false}
                      error={error}
                      artifactResults={results || []}
                      totalInputTokens={tokens?.input}
                      totalOutputTokens={tokens?.output}
                    />
                  </Flex>
                )}
              </Flex>
            </Card>
          </Flex>
        </Splitter.Panel>
      ) : null}
    </Splitter>

  )
})
