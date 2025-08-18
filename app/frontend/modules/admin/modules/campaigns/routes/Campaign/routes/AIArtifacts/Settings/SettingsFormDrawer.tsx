import React, { useCallback, useEffect, useMemo } from 'react'
import {
  Button,
  Card, Drawer,
  Form, Input, Select, Space, Spin, Flex, Splitter, Tooltip, Alert,
} from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { isEqual, debounce, uniqBy } from 'lodash'
import { useParams } from 'react-router-dom'
import { ASSISTANT_TYPES } from '~/modules/admin/modules/AiAssitant/core/constants'
import { slugify } from '~/utils/string'
import { AiArtifact } from '~/modules/admin/modules/campaigns/core/aiArtifacts'
import { AiAssistant, AiAssistantTR } from '~/modules/admin/modules/AiAssitant/core/aiAssistant'
import { useResources } from '~/hooks/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceForm from '~/components/ResourceForm'
import { ArtifactResults } from '../Results/ArtifactResults'
import { DatasheetForm } from './DatasheetForm'
import { CampaignFactorsForm } from './CampaignFactorsForm'
import { AssessmentsForm } from './AssessmentsForm'

type Props = {
  onClose(): void
  aiArtifact?: AiArtifact
  isOpen: boolean
}

const { I18n } = window

const dependencyLabels = {
  datasheet: I18n.t('administration.ai_artifacts.form.datasheet'),
  assessments: I18n.t('administration.ai_artifacts.form.assessments'),
  campaign_factors: I18n.t('administration.ai_artifacts.form.campaign_factors'),
}

export const SettingsFormDrawer: React.FC<Props> = ({ onClose, isOpen, aiArtifact }) => {
  const { resource } = useResourceContext<AiArtifact>()
  const [form] = Form.useForm()
  const [codeManuallyEdited, setCodeManuallyEdited] = React.useState(false)
  const [results, setResults] = React.useState<Array<{key: string, value: string | null, type: string}> | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [testData, setTestData] = React.useState('')
  const [isGenerating, setIsGenerating] = React.useState(false)

  const nameValue = Form.useWatch('name', form)
  const aiAssistantId = Form.useWatch('aiAssistantId', form)
  const code = Form.useWatch('code', form)
  const instructions = Form.useWatch('instructions', form)
  const includeAllDatasheetColumns = Form.useWatch('includeAllDatasheetColumns', form)
  const datasheetColumns = Form.useWatch('datasheetColumns', form)
  const campaignFactors = Form.useWatch('campaignFactors', form)
  const assessments = Form.useWatch('assessments', form)

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

  const aiAssistant = aiArtifact?.aiAssistant?.id ? aiArtifact.aiAssistant : getAiAssistant(aiAssistantId)

  const transformValues = (values) => {
    const newValues = {
      ...values,
      datasheetColumns: values.includeAllDatasheetColumns ? [] : values.datasheetColumns,
      dependenciesAttributes: {
        sheetColumns: values.datasheetColumns?.map(column => ({ id: column })),
        campaignFactors: values.campaignFactors?.map(column => ({ id: column })),
      },
      campaignId,
    }
    delete newValues.datasheetColumns
    delete newValues.campaignFactors
    return newValues
  }

  const isEdit = () => (!!aiArtifact?.id)
  const getTitle = () => `${isEdit() ? I18n.t('common.actions.edit') : I18n.t('common.actions.add')}
     ${I18n.t('administration.ai_artifacts.form.title')}`

  const aiAssistants = aiArtifact?.aiAssistant
    ? uniqBy(aiAssistantsData.concat(aiArtifact?.aiAssistant), 'id') : aiAssistantsData

  const handleClose = () => {
    setResults(null)
    setError(null)
    onClose()
  }

  const handleSubmit = () => {
    form.submit()
  }

  useEffect(() => {
    if (aiArtifact) {
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
    }
    return () => form.resetFields()
  }, [aiArtifact, isOpen])

  useEffect(() => {
    if (!codeManuallyEdited && nameValue) {
      form.setFieldValue('code', slugify(nameValue))
    }
  }, [nameValue])

  const isDirty = useMemo(() => (
    !isEqual(
      {
        name: aiArtifact?.name,
        code: aiArtifact?.code,
        instructions: aiArtifact?.instructions,
        aiAssistantId: aiArtifact?.aiAssistant?.id,
        includeAllDatasheetColumns: aiArtifact?.includeAllDatasheetColumns,
        datasheetColumns: aiArtifact?.dependenciesAttributes.sheetColumns.map(c => c.id),
        campaignFactors: aiArtifact?.dependenciesAttributes.campaignFactors.map(c => c.id),
        assessments: aiArtifact?.assessments,
      },
      {
        name: nameValue,
        code,
        instructions,
        aiAssistantId,
        includeAllDatasheetColumns: form.getFieldValue('includeAllDatasheetColumns'),
        datasheetColumns: form.getFieldValue('datasheetColumns'),
        campaignFactors: form.getFieldValue('campaignFactors'),
        assessments: form.getFieldValue('assessments'),
      },
    )
  ),
  [aiArtifact, nameValue,
    code, form, instructions, aiAssistantId, assessments,
    includeAllDatasheetColumns, datasheetColumns, campaignFactors])

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
    }).then(({ results }: {results: Array<{key: string, value: string | null, type: string}>}) => {
      setResults(results)
    }).catch((e) => {
      setError(e.base[0].detail)
    }).finally(() => {
      setIsGenerating(false)
    })
  }

  return (
    <Drawer
      title={getTitle()}
      placement="right"
      width={aiArtifact ? 1024 : 600}
      height="100vh"
      zIndex={1001}
      open={isOpen}
      onClose={handleClose}
      maskClosable={false}
      closable={false}
      styles={{
        body: {
          height: '100%',
          overflowY: 'hidden',
          padding: 0,
        },
      }}
      extra={(
        <Space>
          <Button htmlType="reset" onClick={handleClose}>{I18n.t('common.actions.cancel')}</Button>
          <Button
            htmlType="submit"
            type="primary"
            onClick={handleSubmit}
            disabled={isGenerating}
          >
            {I18n.t('common.actions.submit')}
          </Button>
        </Space>
      )}
    >

      <Splitter>
        <Splitter.Panel defaultSize="40%" min="40%" max="60%">
          <ResourceForm
            resourceName="ai_artifacts"
            resource={aiArtifact}
            storeManager={{ form }}
            readableResourceName={I18n.t('administration.ai_artifacts.form.title')}
            showSuccessMessages
            scrollToFirstError
            request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
            transformValues={transformValues}
            formProps={{
              initialValues: {
                ...aiArtifact,
                aiAssistantId: aiArtifact?.aiAssistant?.id,
                datasheetColumns: aiArtifact?.dependenciesAttributes.sheetColumns.map(c => c.id),
                campaignFactors: aiArtifact?.dependenciesAttributes.campaignFactors.map(c => c.id),
              },
            }}
            onSuccessfulSubmission={onClose}
            style={{ padding: '2rem' }}
          >
            {() => (
              <>
                <Form.Item
                  name="name"
                  label={I18n.t('administration.common.name')}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="code"
                  label={I18n.t('administration.common.code')}
                  rules={[{ required: true }]}
                >
                  <Input onChange={() => setCodeManuallyEdited(true)} />
                </Form.Item>
                <Form.Item
                  name="instructions"
                  label={I18n.t('administration.common.instructions')}
                  rules={[{ required: true }]}
                >
                  <Input.TextArea />
                </Form.Item>
                <Form.Item
                  name="aiAssistantId"
                  label={I18n.t('administration.ai_artifacts.form.ai_assistant')}
                  rules={[{ required: true }]}
                >
                  <Select
                    showSearch
                    filterOption={false}
                    loading={isAiAssistantsLoading('fetch')}
                    onSearch={debouncedFetchAiAssistantsGroups}
                    notFoundContent={isAiAssistantsLoading('fetch') ? <Spin size="small" /> : null}
                    placeholder={I18n.t('administration.ai_artifacts.form.select_ai_assistant')}
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
                    <Card title={I18n.t('administration.ai_artifacts.form.configuration')}>
                      {(aiAssistant && aiAssistant.dependencies && aiAssistant.dependencies.length > 0) ? (
                        aiAssistant.dependencies.map(dep => (
                          <Card
                            key={dependencyLabels[dep]}
                            type="inner"
                            className="mt-4"
                            title={dependencyLabels[dep]}
                          >
                            {dep === 'campaign_factors' && <CampaignFactorsForm aiArtifact={aiArtifact} /> }
                            {dep === 'assessments' && <AssessmentsForm /> }
                            {dep === 'datasheet' && <DatasheetForm /> }
                          </Card>
                        )))
                        : null
                        }
                    </Card>
                  </Form.Item>
                ) : null}
              </>
            )}
          </ResourceForm>
        </Splitter.Panel>
        {aiArtifact ? (
          <Splitter.Panel className="p-5" defaultSize="60%" min="40%" max="60%">
            <Flex vertical>
              <Card
                title={(
                  <Flex align="center" gap={4}>
                    {I18n.t('administration.ai_artifacts.playground')}
                    <Tooltip title={I18n.t('administration.ai_artifacts.playground_info')}>
                      <InfoCircleOutlined />
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
                    placeholder={I18n.t('administration.ai_artifacts.playground_placeholder')}
                    rows={4}
                  />
                  <Button
                    style={{ alignSelf: 'flex-end' }}
                    type="primary"
                    onClick={() => handleTestGenerate(aiArtifact?.id.toString() as string)}
                    disabled={!testData || isGenerating}
                  >
                    {I18n.t('administration.ai_artifacts.test_generate')}
                  </Button>

                  {isOpen && isDirty && (
                    <Alert message={I18n.t('administration.ai_artifacts.unsaved_changes')} type="warning" />
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
                      />
                    </Flex>
                  )}
                </Flex>
              </Card>
            </Flex>
          </Splitter.Panel>
        ) : null}
      </Splitter>
    </Drawer>
  )
}
