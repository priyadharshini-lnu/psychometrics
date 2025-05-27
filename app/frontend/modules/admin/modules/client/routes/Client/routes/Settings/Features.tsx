import React, { useEffect } from 'react'
import {
  Switch, Form, Space, Typography, Spin, message,
} from 'antd'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'

const { Title } = Typography
const { I18n } = window

interface ClientFeatures {
  smsNotification: boolean;
  id: string;
}

export const Features: React.FC = () => {
  const { clientId } = useParams() as { clientId: string }

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

  const features = featuresData[0] || { smsNotification: false }

  const handleFeatureUpdate = async (smsNotification: boolean) => {
    if (!features.id) return

    try {
      await updateResource({ id: features.id, smsNotification })
      message.success(I18n.t('administration.settings.tabs.settings.feature_toggled_success'))
    } catch (error) {
      console.error('Error updating client features:', error)
      message.error(I18n.t('administration.settings.tabs.settings.feature_toggled_error'))
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={4}>{I18n.t('administration.settings.tabs.feature_flags')}</Title>
      <Form layout="horizontal">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item
            label={I18n.t('administration.settings.tabs.settings.sms_notification')}
            labelCol={{ style: { minWidth: '370px', textAlign: 'left' } }}
          >
            { isLoading('fetch') ? (
              <Spin size="small" />
            ) : (
              <Switch
                checked={!!features.smsNotification}
                onChange={checked => handleFeatureUpdate(checked)}
              />
            )}
          </Form.Item>
        </Space>
      </Form>
    </div>
  )
}
