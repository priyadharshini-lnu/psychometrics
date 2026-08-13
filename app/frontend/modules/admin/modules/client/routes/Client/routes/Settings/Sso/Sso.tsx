import React, { useEffect, useState } from 'react'
import {
  Row, Col, Form, Button, Switch, Input, Skeleton, Space, Tooltip, Divider, Radio, Select,
} from 'antd'
import { useParams } from 'react-router-dom'
import InputDuration from '~/components/InputDuration'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import ResourceForm from '~/components/ResourceForm'
import { ClientSsoSettings } from '~/modules/admin/modules/client/clientSsoSettings'
import { ConfigurationInfo } from '../../Project/routes/Settings/routes/Saml/ConfigurationInfo'
import { MetadataUpload } from './MetadataUpload'

const { I18n } = window

export const Sso: React.FC = () => {
  const { clientId } = useParams() as { clientId: string }
  const [form] = Form.useForm()
  const [certificateExpiry, setCertificateExpiry] = useState<string | null>(null)

  const isEnabled = Form.useWatch('ssoEnabled', form)
  const enforceFor = Form.useWatch('enforceFor', form)

  const {
    data, fetch, updateResource, isLoading, collectionAction,
  } = useResources<ClientSsoSettings>(
    'client_sso_settings',
    {
      basePath: `clients/${clientId}`,
      trackUrl: true,
      apiConfig: { filter: { tenant_id_eq: clientId } },
    },
  )

  const ssoSetting = data[0]

  useEffect(() => {
    fetch()
  }, [clientId])

  useEffect(() => {
    form.setFieldsValue(ssoSetting)
  }, [ssoSetting])

  if (!ssoSetting) return <Skeleton active />

  const handleMetadataParsed = (fields: Record<string, unknown>) => {
    form.setFieldsValue(fields)
    setCertificateExpiry(fields.certificateExpiry as string | null)
  }

  const parseMetadata = (body: Record<string, unknown>) => collectionAction({
    action: 'parse_metadata',
    method: 'post',
    body,
  })

  return (
    <Row justify="space-between" className="pl" gutter={24}>
      <Col xs={24} md={16} xl={12} xxl={10}>
        <ResourceForm
          resourceName="client_sso_settings"
          readableResourceName={I18n.t('admin.sso_settings_readable_resource_name')}
          resource={ssoSetting}
          showSuccessMessages
          storeManager={{ form }}
          formProps={{
            layout: 'horizontal',
            labelCol: {
              sm: 24, md: 10, lg: 8, xl: 8,
            },
            id: 'client-sso-settings-form',
            labelAlign: 'left',
            initialValues: {
              enforceFor: 'none',
            },
          }}
          request={{ updateResource }}
        >
          {() => (
            <>
              <Form.Item
                name="ssoEnabled"
                label={I18n.t('admin.sso_settings_enabled')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              {isEnabled && (
                <Form.Item
                  name="enforceFor"
                  label={I18n.t('admin.sso_enforce_for')}
                >
                  <Radio.Group>
                    <Space direction="vertical">
                      <Radio value="none">{I18n.t('admin.sso_enforce_for_none')}</Radio>
                      <Radio value="all">{I18n.t('admin.sso_enforce_for_all')}</Radio>
                      <Radio value="specific_domains">{I18n.t('admin.sso_enforce_for_specific_domains')}</Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>
              )}

              {isEnabled && enforceFor === 'specific_domains' && (
                <Form.Item
                  name="enforcedDomains"
                  label={I18n.t('admin.sso_enforced_domains')}
                  extra={I18n.t('admin.sso_enforced_domains_hint')}
                  rules={[
                    { required: true, message: I18n.t('errors.messages.blank') },
                    {
                      validator: (_, value) => {
                        if (!value || value.length === 0) return Promise.resolve()
                        // eslint-disable-next-line max-len
                        const domainPattern = /^(\*\.)?[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i
                        const invalidDomains = value.filter(
                          (domain: string) => !domainPattern.test(domain),
                        )
                        if (invalidDomains.length > 0) {
                          return Promise.reject(new Error(I18n.t('errors.messages.invalid')))
                        }
                        return Promise.resolve()
                      },
                    },
                  ]}
                >
                  <Select
                    mode="tags"
                    placeholder={I18n.t('admin.sso_enforced_domains_placeholder')}
                    tokenSeparators={[',', ' ']}
                  />
                </Form.Item>
              )}

              <MetadataUpload
                onParsed={handleMetadataParsed}
                parseMetadata={parseMetadata}
                isLoading={isLoading('post/parse_metadata')}
              />
              <Divider plain>{I18n.t('admin.sso_settings_or_configure_manually')}</Divider>

              <Form.Item
                name="idpEntityId"
                label={I18n.t('admin.sso_settings_entity_id')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="idpSsoUrl"
                label={I18n.t('admin.sso_settings_sso_url')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="idpSloUrl"
                label={I18n.t('admin.sso_settings_slo_url')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="idpCert"
                label={(
                  <Space size={4}>
                    <span>{I18n.t('admin.sso_settings_certificate')}</span>
                    {certificateExpiry && (
                      <Tooltip
                        title={I18n.t('admin.sso_settings_metadata_certificate_expiry', { date: certificateExpiry })}
                      >
                        <span className="cursor-help">
                          <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                        </span>
                      </Tooltip>
                    )}
                  </Space>
                )}
              >
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item
                name="sessionTimeout"
                label={I18n.t('admin.sso_settings_session_timeout')}
              >
                <InputDuration placeholder={I18n.t('administration.components.input_duration.placeholder')} />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading(`update@${ssoSetting.id}`)}
              >
                {I18n.t('admin.sso_settings_save')}
              </Button>
            </>
          )}
        </ResourceForm>
      </Col>
      <Col xs={24} md={8} xl={10} xxl={10}>
        <ConfigurationInfo
          assertionConsumerServiceUrl={ssoSetting.assertionConsumerServiceUrl}
          issuer={ssoSetting.issuer}
        />
      </Col>
    </Row>
  )
}
