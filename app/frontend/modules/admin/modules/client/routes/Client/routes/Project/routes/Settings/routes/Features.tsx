import React, { useEffect } from 'react'
import {
  Switch, Form, Button, Spin, Card, Row, Col, Typography, Tooltip, Space, Flex, theme,
} from 'antd'
import { useParams } from 'react-router-dom'
import {
  QuestionCircleOutlined,
  MessageOutlined,
  AppstoreOutlined,
  InfoCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { AIEditorIcon } from '~/glint/icons/AIEditorIcon'
import { useResources } from '~/hooks/useResources'
import ResourceForm from '~/components/ResourceForm'

const { Text } = Typography
const { I18n } = window

interface ProjectFeatures {
  smsNotification: boolean;
  aiAssistants: boolean;
  aiAssistedIdp: boolean;
  globalSkills: boolean;
  enhanceWithAi: boolean;
  idp: boolean;
  id: string;
  aiTranslation: boolean;
  aiContentAnalysis: boolean;
}

interface ClientFeatures {
  smsNotification: boolean;
  aiAssistants: boolean;
  aiAssistedIdp: boolean;
  globalSkills: boolean;
  enhanceWithAi: boolean;
  idp: boolean;
  id: string;
  aiTranslation: boolean;
  aiContentAnalysis: boolean;
}

interface Project {
  clientId: string;
  id: string;
}

interface FeatureCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, icon, children }) => (
  <Card
    size="small"
    className="mb-4"
    title={(
      <Flex align="center" gap={8}>
        {icon}
        <Text strong>{title}</Text>
      </Flex>
    )}
  >
    {children}
  </Card>
)

interface FeatureToggleProps {
  name: string;
  label: string;
  tooltip?: string;
  help?: string;
  disabled?: boolean;
  isLast?: boolean;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({
  name, label, tooltip, help, disabled = false, isLast = false,
}) => (
  <Form.Item
    name={name}
    label={(
      <Space size={4}>
        <span>{label}</span>
        {tooltip && (
          <Tooltip title={tooltip}>
            <span
              role="button"
              tabIndex={0}
              className="cursor-help"
              onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
              onKeyDown={(e) => { e.stopPropagation() }}
            >
              <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
            </span>
          </Tooltip>
        )}
      </Space>
    )}
    help={help && (
      <Text type="secondary" style={{ fontSize: 12 }}>
        <InfoCircleOutlined style={{ marginRight: 4 }} />
        {help}
      </Text>
    )}
    className={isLast ? 'mb-0' : undefined}
  >
    <Switch disabled={disabled} />
  </Form.Item>
)

export const Features: React.FC = () => {
  const { projectId } = useParams() as { projectId: string }
  const [form] = Form.useForm()
  const aiAssistants = Form.useWatch('aiAssistants', form)
  const { token } = theme.useToken()

  // First fetch project data to get clientId
  const {
    data: projectData,
    fetchSingle: fetchProject,
  } = useResources<Project>('projects')

  const [project] = projectData
  const clientId = project?.clientId

  const {
    data: featuresData,
    fetch: fetchFeature,
    updateResource,
    isLoading,
  } = useResources<ProjectFeatures>(
    'project_features',
    {
      basePath: `projects/${projectId}`,
      trackUrl: true,
      apiConfig: { filter: { project_id_eq: projectId } },
    },
  )

  const {
    data: clientFeaturesData,
    fetch: fetchClientFeatures,
  } = useResources<ClientFeatures>(
    'client_features',
    {
      basePath: clientId ? `clients/${clientId}` : '',
      trackUrl: true,
      apiConfig: { filter: { client_id_eq: clientId } },
    },
  )

  // First fetch project data
  useEffect(() => {
    fetchProject({ id: projectId })
  }, [projectId])

  // Then fetch features when clientId is available
  useEffect(() => {
    fetchFeature()
    if (clientId) {
      fetchClientFeatures()
    }
  }, [projectId, clientId])

  const features = featuresData[0] || {
    smsNotification: false,
    aiAssistants: false,
    aiAssistedIdp: false,
    globalSkills: false,
    enhanceWithAi: false,
    idp: false,
    aiTranslation: false,
    aiContentAnalysis: false,
  }

  const clientFeatures = clientFeaturesData[0] || {
    smsNotification: false,
    aiAssistants: false,
    aiAssistedIdp: false,
    globalSkills: false,
    enhanceWithAi: false,
    idp: false,
    aiTranslation: false,
    aiContentAnalysis: false,
  }

  useEffect(() => {
    if (!clientFeatures.aiAssistants) {
      form.setFieldsValue({
        aiAssistants: false,
        aiAssistedIdp: false,
      })
    }
  }, [clientFeatures.aiAssistants])

  useEffect(() => {
    if (!aiAssistants) {
      form.setFieldsValue({
        aiAssistedIdp: false,
      })
    }
  }, [aiAssistants])

  useEffect(() => {
    if (!clientFeatures.smsNotification) {
      form.setFieldsValue({
        smsNotification: false,
      })
    }
  }, [clientFeatures.smsNotification])

  useEffect(() => {
    if (!clientFeatures.idp) {
      form.setFieldsValue({
        idp: false,
      })
    }
  }, [clientFeatures.idp])

  useEffect(() => {
    if (!clientFeatures.globalSkills) {
      form.setFieldsValue({
        globalSkills: false,
      })
    }
  }, [clientFeatures.globalSkills])

  const isFetchLoading = isLoading('fetch')

  const transformValues = (values) => {
    const transformedValues = {
      ...values,
      smsNotification: !clientFeatures.smsNotification ? false : values.smsNotification || false,
      aiAssistants: !clientFeatures.aiAssistants ? false : values.aiAssistants || false,
      aiAssistedIdp: (!clientFeatures.aiAssistants || !values.aiAssistants) ? false : values.aiAssistedIdp || false,
      idp: !clientFeatures.idp ? false : values.idp || false,
      enhanceWithAi: !clientFeatures.enhanceWithAi ? false : values.enhanceWithAi || false,
      globalSkills: !clientFeatures.globalSkills ? false : values.globalSkills || false,
      aiTranslation: !clientFeatures.aiTranslation ? false : values.aiTranslation || false,
      aiContentAnalysis: !clientFeatures.aiContentAnalysis ? false : values.aiContentAnalysis || false,
    }
    return {
      ...transformedValues,
    }
  }

  const aiAssistedIdpDisabledReason = (() => {
    if (!clientFeatures.aiAssistedIdp) {
      return I18n.t('admin.ai_assisted_idp_disabled_by_client')
    }

    if (!clientFeatures.aiAssistants || !aiAssistants) {
      return I18n.t('admin.ai_assisted_idp_requires_ai_assistants')
    }

    return undefined
  })()

  const enhanceWithAiDisabledReason = (() => {
    if (!clientFeatures.enhanceWithAi) {
      return I18n.t('admin.enable_enhance_with_ai_client_level')
    }

    if (!clientFeatures.aiAssistants || !aiAssistants) {
      return I18n.t('admin.enhance_with_ai_requires_ai_assistants')
    }

    return undefined
  })()

  return (
    <div className="p-6">
      {isFetchLoading ? (
        <div className="flex justify-center mt-8">
          <Spin />
        </div>
      ) : (
        <ResourceForm
          resourceName="project_features"
          readableResourceName={I18n.t('admin.project_features')}
          resource={features}
          storeManager={{ form }}
          request={{ updateResource }}
          scrollToFirstError
          showSuccessMessages
          formProps={{
            layout: 'horizontal',
            labelCol: {
              sm: 24, md: 12, lg: 10, xl: 10,
            },
            labelAlign: 'left',
          }}
          transformValues={transformValues}
        >
          {() => (
            <Row gutter={[16, 0]}>
              <Col xs={24} lg={12}>
                <FeatureCard
                  title={I18n.t('admin.feature_flags_ai_group')}
                  icon={<AIEditorIcon style={{ width: 18, height: 18 }} />}
                >
                  <FeatureToggle
                    name="aiAssistants"
                    label={I18n.t('admin.ai_assistants')}
                    tooltip={I18n.t('admin.feature_ai_assistants_description')}
                    help={!clientFeatures.aiAssistants
                      ? I18n.t('admin.ai_assistants_disabled_by_client')
                      : undefined}
                    disabled={!clientFeatures.aiAssistants}
                  />
                  <div
                    className="ms-4 ps-4"
                    style={{
                      borderLeft: `2px solid ${token.colorBorder}`,
                      display: aiAssistants ? 'block' : 'none',
                    }}
                  >
                    <FeatureToggle
                      name="aiAssistedIdp"
                      label={I18n.t('admin.ai_assisted_idp')}
                      tooltip={I18n.t('admin.feature_ai_assisted_idp_description')}
                      help={aiAssistedIdpDisabledReason}
                      disabled={!clientFeatures.aiAssistedIdp || !clientFeatures.aiAssistants || !aiAssistants}
                    />
                    <FeatureToggle
                      name="enhanceWithAi"
                      label={I18n.t('admin.feature_enhance_with_ai')}
                      tooltip={I18n.t('admin.feature_enhance_with_ai_description')}
                      help={enhanceWithAiDisabledReason}
                      disabled={!clientFeatures.enhanceWithAi || !clientFeatures.aiAssistants || !aiAssistants}
                    />
                    <FeatureToggle
                      name="aiTranslation"
                      label={I18n.t('admin.ai_translation')}
                      tooltip={I18n.t('admin.feature_ai_translation_description')}
                      help={!clientFeatures.aiTranslation
                        ? I18n.t('admin.ai_translation_disabled_by_client')
                        : undefined}
                      disabled={!clientFeatures.aiTranslation}
                    />
                    <FeatureToggle
                      name="aiContentAnalysis"
                      label={I18n.t('admin.ai_content_analysis')}
                      tooltip={I18n.t('admin.feature_ai_content_analysis_description')}
                      help={!clientFeatures.aiContentAnalysis
                        ? I18n.t('admin.ai_content_analysis_disabled_by_client')
                        : undefined}
                      disabled={!clientFeatures.aiContentAnalysis}
                      isLast
                    />
                  </div>
                </FeatureCard>
              </Col>

              <Col xs={24} lg={12}>
                <FeatureCard
                  title={I18n.t('admin.feature_flags_communication_group')}
                  icon={<MessageOutlined />}
                >
                  <FeatureToggle
                    name="smsNotification"
                    label={I18n.t('admin.sms_notification')}
                    tooltip={I18n.t('admin.feature_sms_notification_description')}
                    help={!clientFeatures.smsNotification
                      ? I18n.t('admin.sms_notification_disabled_by_client')
                      : undefined}
                    disabled={!clientFeatures.smsNotification}
                    isLast
                  />
                </FeatureCard>

                <FeatureCard
                  title={I18n.t('admin.feature_flags_platform_group')}
                  icon={<AppstoreOutlined />}
                >
                  <FeatureToggle
                    name="idp"
                    label={I18n.t('admin.idp')}
                    tooltip={I18n.t('admin.feature_idp_description')}
                    help={!clientFeatures.idp
                      ? I18n.t('admin.idp_disabled_by_client')
                      : undefined}
                    disabled={!clientFeatures.idp}
                  />
                  <FeatureToggle
                    name="globalSkills"
                    label={I18n.t('admin.global_skills')}
                    tooltip={I18n.t('admin.feature_global_skills_description')}
                    help={!clientFeatures.globalSkills
                      ? I18n.t('admin.global_skills_disabled_by_client')
                      : undefined}
                    disabled={!clientFeatures.globalSkills}
                    isLast
                  />
                </FeatureCard>
              </Col>

              <Col span={24}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isLoading(`update@${featuresData[0]?.id}`)}
                >
                  {I18n.t('shared.update')}
                </Button>
              </Col>
            </Row>
          )}
        </ResourceForm>
      )}
    </div>
  )
}
