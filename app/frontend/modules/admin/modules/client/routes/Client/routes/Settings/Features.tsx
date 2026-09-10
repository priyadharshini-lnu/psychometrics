import React, { useEffect, useState } from 'react'
import {
  Switch, Form, Typography, Button, Spin, Tooltip, Card, Row, Col, Space, Flex, theme, Modal, Descriptions, App,
} from 'antd'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  QuestionCircleOutlined,
  MessageOutlined,
  AppstoreOutlined,
  LockOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { AIEditorIcon } from '~/glint/icons/AIEditorIcon'
import { useResources } from '~/hooks/useResources'
import ResourceForm from '~/components/ResourceForm'
import { get as getCurrentUser, isSupportAdmin } from '~/core/currentUser'
import { RootState } from '~/modules/admin/core/rootReducers'

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
  useNewCommunicationCenter: boolean;
  superadminTenantScoping: boolean;
  glintUi: boolean;
}

interface MigrationStats {
  wouldMigrate?: number;
  wouldBackfill?: number;
  wouldUsers?: number;
  wouldCcUsers?: number;
  wouldAssessments?: number;
  skipped?: number;
  migrationErrors?: string[];
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
  const { message } = App.useApp()
  const currentUser = useSelector((state: RootState) => getCurrentUser(state))
  const showMigrationTools = isSupportAdmin(currentUser)

  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewStats, setPreviewStats] = useState<MigrationStats | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  const {
    data: featuresData,
    fetch: fetchFeature,
    updateResource,
    isLoading,
    collectionAction,
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
    useNewCommunicationCenter: false,
    superadminTenantScoping: false,
    glintUi: false,
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
      useNewCommunicationCenter: values.useNewCommunicationCenter || false,
      superadminTenantScoping: values.superadminTenantScoping ?? false,
      glintUi: values.glintUi || false,
    }
    return transformedValues
  }

  const handleValuesChange = () => {
    if (features.id) {
      form.submit()
    }
  }

  const handlePreview = async () => {
    setIsPreviewing(true)
    try {
      const result = await collectionAction({
        action: 'migrate_communication_center',
        method: 'post',
        apiConfig: { query: { dry_run: true } },
      })
      setPreviewStats(result as MigrationStats)
      setPreviewVisible(true)
    } catch {
      message.error(I18n.t('admin.communication_center_migration_error'))
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleMigrate = async () => {
    setIsRunning(true)
    try {
      await collectionAction({
        action: 'migrate_communication_center',
        method: 'post',
      })
      message.success(I18n.t('admin.communication_center_migration_enqueued'))
    } catch {
      message.error(I18n.t('admin.communication_center_migration_error'))
    } finally {
      setIsRunning(false)
    }
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
              onValuesChange: handleValuesChange,
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
                    />
                    {showMigrationTools && (
                      <Form.Item
                        label={(
                          <Space size={4}>
                            <span>{I18n.t('admin.use_new_communication_center')}</span>
                            <Tooltip title={I18n.t('admin.feature_use_new_communication_center_description')}>
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
                        className="mb-0"
                      >
                        <Space size={8}>
                          <Form.Item name="useNewCommunicationCenter" noStyle>
                            <Switch />
                          </Form.Item>
                          <Button
                            type="primary"
                            onClick={handlePreview}
                            loading={isPreviewing}
                          >
                            {I18n.t('admin.communication_center_migration_run_button')}
                          </Button>
                        </Space>
                      </Form.Item>
                    )}
                    {!showMigrationTools && (
                      <FeatureToggle
                        name="useNewCommunicationCenter"
                        label={I18n.t('admin.use_new_communication_center')}
                        tooltip={I18n.t('admin.feature_use_new_communication_center_description')}
                        isLast
                      />
                    )}
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
                    />
                    <FeatureToggle
                      name="glintUi"
                      label={I18n.t('admin.glint_ui')}
                      tooltip={I18n.t('admin.feature_glint_ui_description')}
                      isLast
                    />
                  </FeatureCard>

                  <FeatureCard
                    title={I18n.t('admin.feature_flags_superadmin_group')}
                    icon={<LockOutlined />}
                  >
                    <FeatureToggle
                      name="superadminTenantScoping"
                      label={I18n.t('admin.superadmin_tenant_scoping')}
                      tooltip={I18n.t('admin.feature_superadmin_tenant_scoping_description')}
                      isLast
                    />
                  </FeatureCard>
                </Col>

              </Row>
            )}
          </ResourceForm>
        )
      }

      <Modal
        title={I18n.t('admin.communication_center_migration_modal_title')}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={(
          <Space>
            <Button onClick={() => setPreviewVisible(false)}>
              {I18n.t('shared.cancel')}
            </Button>
            <Button
              type="primary"
              loading={isRunning}
              onClick={() => {
                setPreviewVisible(false)
                handleMigrate()
              }}
            >
              {I18n.t('admin.communication_center_migration_run_button')}
            </Button>
          </Space>
        )}
      >
        <p>{I18n.t('admin.communication_center_migration_modal_intro')}</p>
        {previewStats && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={I18n.t('admin.communication_center_migration_would_migrate')}>
              {previewStats.wouldMigrate ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('admin.communication_center_migration_skipped')}>
              {previewStats.skipped ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('admin.communication_center_migration_would_backfill')}>
              {previewStats.wouldBackfill ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('admin.communication_center_migration_would_users')}>
              {previewStats.wouldUsers ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('admin.communication_center_migration_would_cc_users')}>
              {previewStats.wouldCcUsers ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('admin.communication_center_migration_would_assessments')}>
              {previewStats.wouldAssessments ?? 0}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
