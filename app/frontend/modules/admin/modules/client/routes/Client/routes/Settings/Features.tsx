import React, { useEffect } from 'react'
import {
  Switch, Form, Typography, Button, Spin, Tooltip, Card, Row, Col, Space, Flex, theme,
} from 'antd'
import { useParams } from 'react-router-dom'
import {
  QuestionCircleOutlined,
  MessageOutlined,
  AppstoreOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { AIEditorIcon } from '~/glint/icons/AIEditorIcon'
import { useResources } from '~/hooks/useResources'
import ResourceForm from '~/components/ResourceForm'

const { Text } = Typography
const { I18n } = window

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

interface FeatureCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  tag?: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title, icon, children, tag,
}) => (
  <Card
    size="small"
    className="mb-4"
    title={(
      <Flex align="center" gap={8}>
        {icon}
        <Text strong>{title}</Text>
        {tag}
      </Flex>
    )}
  >
    {children}
  </Card>
)

interface FeatureToggleProps {
  name: string;
  label: string;
  tooltip: string;
  isLast?: boolean;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({
  name, label, tooltip, isLast = false,
}) => (
  <Form.Item
    name={name}
    label={(
      <Space size={4}>
        <span>{label}</span>
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
      </Space>
    )}
    className={isLast ? 'mb-0' : undefined}
  >
    <Switch />
  </Form.Item>
)

export const Features: React.FC = () => {
  const { clientId } = useParams() as { clientId: string }
  const [form] = Form.useForm()
  const aiAssistants = Form.useWatch('aiAssistants', form)
  const { token } = theme.useToken()
  const {
    data: featuresData,
    fetch: fetchFeature,
    updateResource,
    isLoading,
  } = useResources<ClientFeatures>(
    'client_features',
    {
      basePath: `clients/${clientId}`,
      trackUrl: true,
      apiConfig: { filter: { client_id_eq: clientId } },
    },
  )


  useEffect(() => {
    fetchFeature()
  }, [clientId])

  const features = featuresData[0] || {
    smsNotification: false,
    aiAssistants: false,
    aiAssistedIdp: false,
    enhanceWithAi: false,
    globalSkills: false,
    idp: false,
    aiTranslation: false,
    aiContentAnalysis: false,
  }

  const isFetchLoading = isLoading('fetch')

  const transformValues = (values) => {
    const transformedValues = {
      ...values,
      smsNotification: values.smsNotification || false,
      aiAssistants: values.aiAssistants || false,
      aiAssistedIdp: !values.aiAssistants ? false : values.aiAssistedIdp || false,
      enhanceWithAi: !values.aiAssistants ? false : values.enhanceWithAi || false,
      aiTranslation: !values.aiAssistants ? false : values.aiTranslation || false,
      aiContentAnalysis: !values.aiAssistants ? false : values.aiContentAnalysis || false,
      globalSkills: values.globalSkills || false,
      idp: values.idp || false,
    }
    return transformedValues
  }

  return (
    <div className="p-6">
      { isFetchLoading ? (
        <div className="flex justify-center mt-8">
          <Spin />
        </div>
      )
        : (
          <ResourceForm
            resourceName="client_features"
            readableResourceName={I18n.t('admin.client_features')}
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
                      isLast={!aiAssistants}
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
                      />
                      <FeatureToggle
                        name="enhanceWithAi"
                        label={I18n.t('admin.feature_enhance_with_ai')}
                        tooltip={I18n.t('admin.feature_enhance_with_ai_description')}
                      />
                      <FeatureToggle
                        name="aiTranslation"
                        label={I18n.t('admin.ai_translation')}
                        tooltip={I18n.t('admin.feature_ai_translation_description')}
                      />
                      <FeatureToggle
                        name="aiContentAnalysis"
                        label={I18n.t('admin.ai_content_analysis')}
                        tooltip={I18n.t('admin.feature_ai_content_analysis_description')}
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
                    />
                    <FeatureToggle
                      name="globalSkills"
                      label={I18n.t('admin.global_skills')}
                      tooltip={I18n.t('admin.feature_global_skills_description')}
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
        )
      }
    </div>
  )
}
