import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Form, Input, Button, Switch, App,
  Select, Space, Tooltip, Divider,
} from 'antd'
import { useParams } from 'react-router-dom'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  get as getSamlSetting,
  UPDATE_SETTINGS,
  parseMetadata as parseMetadataAction,
} from '~/modules/admin/modules/client/core/samlSetting'
import ResourceForm from '~/components/ResourceForm'
import { isRequestInProgress } from '~/core/request'
import { MetadataUpload } from '~/modules/admin/modules/client/routes/Client/routes/Settings/Sso/MetadataUpload'
import { ConfigurationInfo } from './ConfigurationInfo'

const connector = connect(
  (state: RootState) => ({
    samlSetting: getSamlSetting(state),
    isSaving: isRequestInProgress(state, UPDATE_SETTINGS),
  }),
  { parseMetadata: parseMetadataAction },
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

const { I18n } = window

const SamlComponent: React.FC<Props> = ({
  samlSetting, isSaving, parseMetadata,
}) => {
  const [form] = Form.useForm()
  const { projectId } = useParams() as { projectId: string }
  const { message } = App.useApp()
  const [certificateExpiry, setCertificateExpiry] = useState<string | null>(null)

  const nameIdentifierFormat = Form.useWatch('nameIdentifierFormat', form)

  const handleSuccessfullSave = () => {
    message.success(I18n.t('administration.saml_settings.successfully_saved_msg'), 6)
  }

  const samlSettingData = samlSetting.emailPipetext ? samlSetting
    : { ...samlSetting, emailPipetext: '{{identifier}}@example.com' }

  const handleMetadataParsed = (fields: Record<string, unknown>) => {
    form.setFieldsValue({
      entityId: fields.idpEntityId,
      ssoServiceUrl: fields.idpSsoUrl,
      cert: fields.idpCert,
    })
    setCertificateExpiry(fields.certificateExpiry as string | null)
  }

  const handleParseMetadata = (body: Record<string, unknown>): Promise<unknown> => parseMetadata(projectId, body)
    .then((action: { response: Record<string, unknown> }) => action.response)

  return (
    <Row justify="space-between">
      <Col sm={24} md={16} xl={12} xxl={10}>
        <ResourceForm
          resourceName="samlSetting"
          requestScope="campaigns"
          resourceBaseUrl={`/administration/projects/${projectId}/saml_settings`}
          resource={samlSetting.id ? samlSettingData : undefined}
          storeManager={{ form }}
          readableResourceName={I18n.t('administration.saml_settings.saml_setting')}
          onSuccessfulSubmission={handleSuccessfullSave}
          formProps={{
            layout: 'horizontal',
            labelCol: {
              sm: 24, md: 10, lg: 8, xl: 8,
            },
            labelAlign: 'left',
            initialValues: { emailPipetext: '{{identifier}}@example.com' },
          }
        }
        >
          {() => (
            <>
              <Form.Item
                name="enabled"
                label={I18n.t('administration.saml_settings.enabled')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="enforced"
                label={I18n.t('admin.sso_enforced')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <MetadataUpload
                onParsed={handleMetadataParsed}
                parseMetadata={handleParseMetadata}
                isLoading={false}
              />
              <Divider plain>{I18n.t('admin.sso_settings_or_configure_manually')}</Divider>

              <Form.Item
                name="entityId"
                label={I18n.t('administration.saml_settings.entity_id')}
                required
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="ssoServiceUrl"
                label={I18n.t('administration.saml_settings.sso_service_url')}
                required
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="cert"
                label={(
                  <Space size={4}>
                    <span>{I18n.t('administration.saml_settings.cert')}</span>
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
                required
              >
                <Input.TextArea spellCheck="false" />
              </Form.Item>

              <Form.Item
                name="afterSignoutUrl"
                label={I18n.t('administration.saml_settings.after_signout_url')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="nameIdentifierFormat"
                initialValue="email"
                label={I18n.t('administration.saml_settings.name_identifier_format')}
              >
                <Select
                  className="mb8 width150px"
                >
                  {['email', 'persistent'].map(idFormat => (
                    <Select.Option key={idFormat} value={idFormat}>
                      {I18n.t(`administration.saml_settings.name_identifier_formats.${idFormat}`)}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {nameIdentifierFormat === 'persistent'
                && (
                  <Form.Item
                    name="emailPipetext"
                    label={I18n.t('administration.saml_settings.email_pipetext')}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                )}

              <Button
                type="primary"
                htmlType="submit"
                loading={isSaving}
              >
                {I18n.t('administration.saml_settings.save')}
              </Button>
            </>
          )}
        </ResourceForm>
      </Col>
      <Col sm={24} md={16} xl={10}>
        <ConfigurationInfo
          assertionConsumerServiceUrl={samlSetting.assertionConsumerServiceUrl}
          issuer={samlSetting.issuer}
        />
      </Col>
    </Row>
  )
}

export const Saml = connector(SamlComponent)
