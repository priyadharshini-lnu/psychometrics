import React, { useEffect } from 'react'
import {
  Switch, Form, Button, Spin,
  Col,
  Row,
} from 'antd'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import ResourceForm from '~/components/ResourceForm'

const { I18n } = window

interface ProjectFeatures {
  smsNotification: boolean;
  aiAssistants: boolean;
  aiAssistedIdp: boolean;
  globalSkills: boolean;
  enhanceWithAi: boolean;
  idp: boolean;
  id: string;
}

interface ClientFeatures {
  smsNotification: boolean;
  aiAssistants: boolean;
  aiAssistedIdp: boolean;
  globalSkills: boolean;
  enhanceWithAi: boolean;
  idp: boolean;
  id: string;
}

interface Project {
  clientId: string;
  id: string;
}

export const Features: React.FC = () => {
  const { projectId } = useParams() as { projectId: string }
  const [form] = Form.useForm()
  const aiAssistants = Form.useWatch('aiAssistants', form)

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
  }

  const clientFeatures = clientFeaturesData[0] || {
    smsNotification: false,
    aiAssistants: false,
    aiAssistedIdp: false,
    globalSkills: false,
    enhanceWithAi: false,
    idp: false,
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
    }
    return {
      ...transformedValues,
    }
  }

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
    <Row className="pl">
      <Col span={24}>
        { isFetchLoading ? (
          <div className="flex justify-center">
            <Spin />
          </div>
        )
          : (
            <ResourceForm
              resourceName="project_features"
              readableResourceName={I18n.t('administration.project_features.project_features')}
              resource={features}
              storeManager={{ form }}
              request={{ updateResource }}
              scrollToFirstError
              showSuccessMessages
              formProps={{
                layout: 'horizontal',
                labelCol: {
                  sm: 24, md: 10, lg: 8, xl: 8,
                },
                labelAlign: 'left',
              }}
              transformValues={transformValues}
            >
              {() => (
                <>
                  <Form.Item
                    name="smsNotification"
                    label={I18n.t('administration.client_features.form.sms_notification')}
                    help={
                    !clientFeatures.smsNotification
                      ? I18n.t('administration.client_features.form.sms_notification_disabled_by_client')
                      : undefined
                  }
                  >
                    <Switch disabled={!clientFeatures.smsNotification} />
                  </Form.Item>

                  <Form.Item
                    name="aiAssistants"
                    label={I18n.t('administration.client_features.form.ai_assistants')}
                    help={
                    !clientFeatures.aiAssistants
                      ? I18n.t('administration.client_features.form.ai_assistants_disabled_by_client')
                      : undefined
                  }
                  >
                    <Switch disabled={!clientFeatures.aiAssistants} />
                  </Form.Item>

                  <Form.Item
                    name="aiAssistedIdp"
                    label={I18n.t('administration.client_features.form.ai_assisted_idp')}
                    help={
                    (!clientFeatures.aiAssistants || !aiAssistants)
                      ? I18n.t('administration.client_features.form.ai_assisted_idp_requires_ai_assistants')
                      : undefined
                  }
                  >
                    <Switch disabled={!clientFeatures.aiAssistants || !aiAssistants} />
                  </Form.Item>

                  <Form.Item
                    name="idp"
                    label={I18n.t('administration.client_features.form.idp')}
                    help={
                    !clientFeatures.idp
                      ? I18n.t('administration.client_features.form.idp_disabled_by_client')
                      : undefined
                  }
                  >
                    <Switch disabled={!clientFeatures.idp} />
                  </Form.Item>

                  <Form.Item
                    name="enhanceWithAi"
                    label={I18n.t('admin.feature_enhance_with_ai')}
                    help={enhanceWithAiDisabledReason}
                  >
                    <Switch
                      disabled={!clientFeatures.enhanceWithAi
                          || !clientFeatures.aiAssistants
                          || !aiAssistants
                        }
                    />
                  </Form.Item>

                  <Form.Item
                    name="globalSkills"
                    label={I18n.t('administration.client_features.form.global_skills')}
                    help={
                    !clientFeatures.globalSkills
                      ? I18n.t('administration.client_features.form.global_skills_disabled_by_client')
                      : undefined
                  }
                  >
                    <Switch disabled={!clientFeatures.globalSkills} />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="mb-16"
                    loading={isLoading(`update@${featuresData[0]?.id}`)}
                  >
                    {I18n.t('common.actions.update')}
                  </Button>
                </>
              )}
            </ResourceForm>
          )
      }
      </Col>
    </Row>
  )
}
