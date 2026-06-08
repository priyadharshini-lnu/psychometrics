import {
  Form, Input, Switch, Card, Col, Row, Button, Select, Spin, message, Space, Alert,
} from 'antd'
import _ from 'lodash'
import {
  useCallback, useEffect, useMemo, useState,
} from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { useParams } from 'react-router-dom'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import {
  Idp, IdpTR, Skill, Report, ReportTR, IdpAssistant,
} from '~/modules/admin/modules/client/core/idp'


const { I18n } = window

export type CategorizedSkills = {
  behavioralGlobalSkills: Skill[],
  behavioralClientSkills: Skill[],
  technicalGlobalSkills: Skill[],
  technicalClientSkills: Skill[],
}

type OptionsType = {
  id: string
  name?: string
}

type IDPDetailsFormProps = {
  idp: Idp,
  fetch: () => void,
}

const IDPDetailsForm = ({
  idp, fetch,
}: IDPDetailsFormProps) => {
  const clientId = useSelector<RootState>(state => state.project.clientId)
  const { projectId } = useParams() as { projectId: string, id: string }

  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)
  const aiEnabled = Form.useWatch('aiEnabled', form)
  const oneClickIdpEnabled = Form.useWatch('oneClickIdpEnabled', form)
  const aiAssistedIdpFeatureEnabled = idp?.meta?.projectFeatures?.aiAssistedIdp || false

  const baseApiConfig = {
    basePath: `projects/${projectId}`,
    trackUrl: true,
    responseType: IdpTR,
    apiConfig: {
      fields: {
        skills: ['id', 'name', 'skill_type', 'project_id'],
      },
      include: ['skills', 'report', 'one_click_ai_assistant', 'document_analysis_ai_assistant',
        'skill_gap_report_analysis_ai_assistant',
      ],
    },
  }

  const { updateResource: update } = useResources<Idp>('idp_templates', baseApiConfig)


  const {
    fetch: fetchAvailableReports, data: availableReports, isLoading: isReportLoading,
  } = useResources<Report>('reports', {
    basePath: `clients/${clientId}`,
    responseType: ReportTR,
    trackUrl: true,
    apiConfig: {
      fields: {
        reports: ['name'],
      },
    },
  })

  const {
    data: idpAssistants, fetch: fetchIdpAssistants, isLoading: isIdpAssistantsLoading,
  } = useResources<IdpAssistant>('assistants', {
    basePath: '/ai',
    apiConfig: {
      fields: { assistants: ['name'] },
      filter: { assistant_type_eq: 'idp_assistant' },
    },
  })

  const {
    data: documentAssistants, fetch: fetchDocumentAssistants, isLoading: isDocumentAssistantsLoading,
  } = useResources<IdpAssistant>('assistants', {
    basePath: '/ai',
    apiConfig: {
      fields: { assistants: ['name'] },
      filter: { assistant_type_eq: 'assistant_tool' },
    },
  })

  useEffect(() => {
    if (idp) {
      form.setFieldsValue({
        name: idp.name,
        description: idp.description,
        self_rating_enabled: idp?.selfRatingEnabled ?? false,
      })
    }
  }, [idp, form])

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      const values = await form.validateFields()

      const payload = {
        name: values.name,
        description: values.description,
        project: { id: projectId, type: 'projects' },
        report: values.reportId ? { id: values.reportId, type: 'reports' } : undefined,
        selfRatingEnabled: values.selfRatingEnabled,
        aiEnabled: values.aiEnabled,
        aiAssistedIdpEnabled: values.aiAssistedIdpEnabled,
        oneClickIdpEnabled: values.oneClickIdpEnabled,
        oneClickAiAssistant: values.oneClickAiAssistantId
          ? { id: values.oneClickAiAssistantId, type: 'assistants' }
          : undefined,
        documentAnalysisAiAssistant: values.documentAnalysisAiAssistantId
          ? { id: values.documentAnalysisAiAssistantId, type: 'assistants' }
          : undefined,
        skillGapReportAnalysisAiAssistant: values.skillGapReportAnalysisAiAssistantId
          ? { id: values.skillGapReportAnalysisAiAssistantId, type: 'assistants' }
          : undefined,
      }

      try {
        await update({ id: idp.id, ...payload })
        message.success(I18n.t('admin.idp_details_updated'))
      } catch (e) {
        if (e?.base?.[0]) {
          message.error(e?.base?.[0]?.title)
        }
      }

      fetch()
    } finally {
      setIsLoading(false)
    }
  }

  const initialValues = useMemo(() => {
    const skills: Record<keyof CategorizedSkills, string[]> = {
      behavioralGlobalSkills: [],
      behavioralClientSkills: [],
      technicalGlobalSkills: [],
      technicalClientSkills: [],
    }

    if (idp) {
      return {
        name: idp.name,
        description: idp.description,
        selfRatingEnabled: idp?.selfRatingEnabled ?? false,
        behavioralGlobalTags: idp.behaviouralGlobalTags,
        behavioralClientTags: idp.behaviouralClientTags,
        technicalGlobalTags: idp.technicalGlobalTags,
        technicalClientTags: idp.technicalClientTags,
        reportId: idp.report?.id,
        titleText: idp.titleText,
        subtitleText: idp.subtitleText,
        fields: idp.fields,
        showReflections: idp.showReflections,
        logoType: idp.logoType,
        aiEnabled: idp.aiEnabled,
        aiAssistedIdpEnabled: idp.aiAssistedIdpEnabled,
        oneClickAiAssistantId: idp.oneClickAiAssistant?.id,
        documentAnalysisAiAssistantId: idp.documentAnalysisAiAssistant?.id,
        skillGapReportAnalysisAiAssistantId: idp.skillGapReportAnalysisAiAssistant?.id,
        oneClickIdpEnabled: idp.oneClickIdpEnabled,
        skillSourcePreference: idp.skillSourcePreference,
        ...skills,
      }
    }
    return {
      selfRatingEnabled: true,
      fields: [],
    }
  }, [idp])

  const debouncedFetchReports = useCallback(_.debounce((value) => {
    if (value.length >= 1) {
      fetchAvailableReports({
        apiConfig: {
          filter: { name_cont: value },
          fields: { reports: ['name'] },
        },
      })
    }
  }, 300), [])

  const reports = idp?.report ? availableReports.concat(idp?.report) : availableReports

  const getIdpAssistants = (): OptionsType[] => {
    if (idp.oneClickAiAssistant && idpAssistants.find(d => idp.oneClickAiAssistant?.id === d.id)) {
      return idpAssistants
    }

    return idp.oneClickAiAssistant ? [...idpAssistants, idp.oneClickAiAssistant] : idpAssistants
  }

  const getDocumentAssistants = (): OptionsType[] => {
    if (idp.documentAnalysisAiAssistant && documentAssistants.find(d => idp.documentAnalysisAiAssistant?.id === d.id)) {
      return documentAssistants
    }

    if (idp.skillGapReportAnalysisAiAssistant
      && documentAssistants.find(d => idp.skillGapReportAnalysisAiAssistant?.id === d.id)) {
      return documentAssistants
    }

    const docAnalysis = idp.documentAnalysisAiAssistant
      ? [...documentAssistants, idp.documentAnalysisAiAssistant]
      : documentAssistants

    return idp.skillGapReportAnalysisAiAssistant
      ? [...docAnalysis, idp.skillGapReportAnalysisAiAssistant]
      : docAnalysis
  }

  return (
    <Form form={form} layout="vertical" initialValues={initialValues}>
      <Space orientation="vertical" className="w-100">
        {idp.aiEnabled && !aiAssistedIdpFeatureEnabled && (
          <Alert
            message={I18n.t('admin.ai_assisted_idp_feature_disabled')}
            type="warning"
            showIcon
          />
        )}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title={I18n.t('admin.idp_template_details')}>
              <Form.Item
                name="name"
                label={I18n.t('shared.name')}
                rules={[{ required: true, message: I18n.t('admin.idp_enter_template_name_error') }]}
              >
                <Input placeholder={I18n.t('shared.name')} />
              </Form.Item>

              <Form.Item
                name="description"
                label={I18n.t('shared.description')}
                rules={[{ required: true, message: I18n.t('admin.idp_enter_template_description_error') }]}
              >
                <Input placeholder={I18n.t('shared.description')} />
              </Form.Item>

              <Form.Item
                name="reportId"
                label={I18n.t('admin.idp_skill_gap_report')}
              >
                <Select
                  showSearch={{ filterOption: false, onSearch: debouncedFetchReports }}
                  notFoundContent={isReportLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
                  placeholder={I18n.t('admin.idp_select_skill_gap_report')}
                >
                  {reports.map(({ id, name }) => (
                    <Select.Option key={id} value={id}>{name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>


              <Form.Item name="selfRatingEnabled" label={I18n.t('admin.idp_self_rating')}>
                <Switch checkedChildren={I18n.t('yes')} unCheckedChildren={I18n.t('no')} />
              </Form.Item>
              {(idp.aiEnabled || aiAssistedIdpFeatureEnabled) && (
                <Form.Item
                  name="aiEnabled"
                  label={I18n.t('admin.idp_ai_enabled')}
                  valuePropName="checked"
                >
                  <Switch disabled={!aiAssistedIdpFeatureEnabled} />
                </Form.Item>
              )}
            </Card>
          </Col>
          {aiEnabled && (
            <Col xs={24} md={12}>
              <Card title={I18n.t('admin.idp_ai_settings')}>
                {/* uncomment this when AI Assisted IDP is ready
                <Form.Item
                  name="aiAssistedIdpEnabled"
                  label={I18n.t('admin.idp_ai_assisted_idp_enabled')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item> */}

                <Form.Item
                  name="oneClickIdpEnabled"
                  label={I18n.t('admin.idp_one_click_idp_enabled')}
                  valuePropName="checked"
                >
                  <Switch disabled={!aiAssistedIdpFeatureEnabled} />
                </Form.Item>

                {oneClickIdpEnabled && (
                  <>
                    <Form.Item
                      name="oneClickAiAssistantId"
                      label={I18n.t('admin.idp_ai_assistant')}
                      rules={[{ required: true, message: I18n.t('admin.ai_assistant_required') }]}
                    >
                      <Select
                        disabled={!aiAssistedIdpFeatureEnabled}
                        showSearch={{
                          filterOption: false,
                          onSearch: (value) => {
                            fetchIdpAssistants({
                              apiConfig: { filter: { filterable_fields: value } },
                            })
                          },
                        }}
                        notFoundContent={
                          isIdpAssistantsLoading('fetch')
                            ? <Spin size="small" />
                            : I18n.t('shared.no_results_found')
                        }
                      >
                        {getIdpAssistants().map(({ id, name }) => (
                          <Select.Option key={id} value={id}>{name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="documentAnalysisAiAssistantId"
                      label={I18n.t('admin.idp_document_ai_assistant')}
                    >
                      <Select
                        disabled={!aiAssistedIdpFeatureEnabled}
                        showSearch={{
                          filterOption: false,
                          onSearch: (value) => {
                            fetchDocumentAssistants({
                              apiConfig: { filter: { filterable_fields: value } },
                            })
                          },
                        }}
                        notFoundContent={
                          isDocumentAssistantsLoading('fetch')
                            ? <Spin size="small" />
                            : I18n.t('shared.no_results_found')
                        }
                      >
                        {getDocumentAssistants().map(({ id, name }) => (
                          <Select.Option key={id} value={id}>{name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="skillGapReportAnalysisAiAssistantId"
                      label={I18n.t('admin.idp_skill_gap_report_ai_assistant')}
                    >
                      <Select
                        disabled={!aiAssistedIdpFeatureEnabled}
                        showSearch={{
                          filterOption: false,
                          onSearch: (value) => {
                            fetchDocumentAssistants({
                              apiConfig: { filter: { filterable_fields: value } },
                            })
                          },
                        }}
                        notFoundContent={
                          isDocumentAssistantsLoading('fetch')
                            ? <Spin size="small" />
                            : I18n.t('shared.no_results_found')
                        }
                      >
                        {getDocumentAssistants().map(({ id, name }) => (
                          <Select.Option key={id} value={id}>{name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </>

                )}
                {/* commented till AI Skill generation implemented
                  <Form.Item name="skillSourcePreference" label={I18n.t('admin.idp_skill_source_preference')}>
                  <Radio.Group>
                    <Radio value="from_template">{I18n.t('admin.idp_skill_sources_from_template')}</Radio>
                    <Radio value="from_ai">{I18n.t('admin.idp_skill_sources_from_ai')}</Radio>
                  </Radio.Group>
                </Form.Item> */}
              </Card>
            </Col>
          )}
        </Row>
        <Button
          key="submit"
          type="primary"
          disabled={!idp.allowEdit}
          onClick={handleSubmit}
        >
          {isLoading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('shared.update')}
        </Button>
      </Space>
    </Form>
  )
}

export default IDPDetailsForm
