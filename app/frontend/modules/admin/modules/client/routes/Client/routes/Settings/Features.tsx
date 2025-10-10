import React, { useEffect } from 'react'
import {
  Switch, Form, Typography, Button, Spin,
} from 'antd'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import ResourceForm from '~/components/ResourceForm'

const { Title } = Typography
const { I18n } = window

interface ClientFeatures {
  smsNotification: boolean;
  aiAssistants: boolean;
  aiAssistedIdp: boolean;
  globalSkills: boolean;
  idp: boolean;
  id: string;
}

export const Features: React.FC = () => {
  const { clientId } = useParams() as { clientId: string }
  const [form] = Form.useForm()
  const aiAssistants = Form.useWatch('aiAssistants', form)
  const idp = Form.useWatch('idp', form)
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
    smsNotification: false, aiAssistants: false, aiAssistedIDP: false,
  }

  const isFetchLoading = isLoading('fetch')

  useEffect(() => {
    if (!aiAssistants) {
      form.setFieldsValue({
        aiAssistedIdp: false,
      })
    }
  }, [aiAssistants])

  useEffect(() => {
    if (!idp) {
      form.setFieldsValue({
        globalSkills: false,
      })
    }
  }, [idp])

  const transformValues = (values) => {
    const transformedValues = {
      ...values,
      smsNotification: values.smsNotification || false,
      aiAssistants: values.aiAssistants || false,
      aiAssistedIdp: !values.aiAssistants ? false : values.aiAssistedIdp || false,
      globalSkills: !values.idp ? false : values.globalSkills || false,
      idp: values.idp || false,
    }
    return {
      ...transformedValues,
    }
  }

  return (
    <div className="p-6 pt-0">
      <Title level={4}>{I18n.t('administration.settings.tabs.feature_flags')}</Title>
      { isFetchLoading ? (
        <div className="flex justify-center">
          <Spin />
        </div>
      )
        : (
          <ResourceForm
            resourceName="client_features"
            readableResourceName={I18n.t('administration.client_features.client_features')}
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
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="idp"
                  label={I18n.t('administration.client_features.form.idp')}
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="aiAssistants"
                  label={I18n.t('administration.client_features.form.ai_assistants')}
                >
                  <Switch />
                </Form.Item>
                {aiAssistants
                  ? (
                    <Form.Item
                      name="aiAssistedIdp"
                      label={I18n.t('administration.client_features.form.ai_assisted_idp')}
                    >
                      <Switch />
                    </Form.Item>
                  ) : null
                }
                <Form.Item
                  name="globalSkills"
                  label={I18n.t('administration.client_features.form.global_skills')}
                  help={!idp ? I18n.t('administration.client_features.form.global_skills_requires_idp') : undefined}
                >
                  <Switch disabled={!idp} />
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
    </div>
  )
}
