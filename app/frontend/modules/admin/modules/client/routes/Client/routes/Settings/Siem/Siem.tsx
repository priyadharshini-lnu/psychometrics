import React, { useEffect, useState } from 'react'
import {
  Row, Col, Form, Input, Button, Switch, Space, Typography, Select, App, Alert,
} from 'antd'
import { useParams } from 'react-router-dom'
import { MailOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ResourceForm from '~/components/ResourceForm'
import { useResources } from '~/hooks/useResources'
/* eslint-disable max-len */
import { ClientAuditlogExportSetting, ClientAuditlogExportSettingtTR } from '~/modules/admin/modules/client/core/clientAuditlogExportSettings'


type Props = object

const { I18n } = window

const FILTERED_DATA = '<FILTERED>'

export const Siem: React.FC<Props> = () => {
  const { clientId } = useParams() as { clientId: string }
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<ClientAuditlogExportSetting | null>(null)
  const [passwordToBeChanged, setPasswordToBeChanged] = useState(false)
  const { updateResource, collectionAction } = useResources<ClientAuditlogExportSetting>(
    'client_auditlog_export_settings', {
      responseType: ClientAuditlogExportSettingtTR,
      basePath: `clients/${clientId}`,
    },
  )

  useEffect(() => {
    collectionAction({ action: 'create_or_get', method: 'get' }).then(updateSettings)
  }, [clientId])

  const updateSettings = (settings: ClientAuditlogExportSetting) => {
    setSettings(settings)
    if (!settings.s3SecretAccessKey) setPasswordToBeChanged(true)
  }

  const handleUpdate = (values: ClientAuditlogExportSetting) => {
    setIsLoading(true)
    delete values.platformError

    const { s3SecretAccessKey, ...valuesWithoutEncrypted } = values

    return updateResource(
      s3SecretAccessKey && s3SecretAccessKey !== FILTERED_DATA ? values : valuesWithoutEncrypted,
    ).then((settings: ClientAuditlogExportSetting) => {
      setSettings(settings)
      setIsLoading(false)
    })
  }


  const [form] = Form.useForm()
  const destinationType = Form.useWatch('destinationType', form)

  if (!settings) return null

  return (
    <Row justify="space-between" className="pl">
      <Col xs={24} md={16} xl={12} xxl={10}>
        {settings.platformError && <Alert message={settings.platformError} type="error" />}
        <ResourceForm
          resourceName="clientAuditlogExportSetting"
          readableResourceName={I18n.t('admin.settings_siem_readable_resource_name')}
          requestScope="clients"
          showSuccessMessages
          resource={settings}
          storeManager={{ form }}
          request={{ updateResource: handleUpdate }}
          formProps={{
            layout: 'horizontal',
            labelCol: {
              sm: 24, md: 10, lg: 8, xl: 8,
            },
            id: 'edit_client_auditlog_export_setting',
            labelAlign: 'left',
          }}
        >
          {() => (
            <>
              <Form.Item
                name="active"
                label={I18n.t('admin.settings_siem_enabled')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="destinationType"
                label={I18n.t('admin.settings_siem_destination_type')}
              >
                <Select>
                  <Select.Option value="s3">
                    {I18n.t('admin.settings_siem_destination_types_s3')}
                  </Select.Option>
                  <Select.Option value="s3_compatible">
                    {I18n.t('admin.settings_siem_destination_types_s3_compatible')}
                  </Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="s3Region"
                label={I18n.t('admin.settings_siem_s3_region')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="s3BucketName"
                label={I18n.t('admin.settings_siem_s3_bucket_name')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="s3BucketFolder"
                label={I18n.t('admin.settings_siem_s3_bucket_folder')}
              >
                <Input />
              </Form.Item>

              {destinationType === 's3_compatible' && (
                <Form.Item
                  name="s3Endpoint"
                  label={I18n.t('admin.settings_siem_s3_endpoint')}
                >
                  <Input />
                </Form.Item>
              )}

              <Form.Item
                name="description"
                label={I18n.t('shared.description')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="s3AccessKeyId"
                label={I18n.t('admin.settings_siem_s3_access_key_id')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="s3SecretAccessKey"
                label={I18n.t('admin.settings_siem_s3_secret_access_key')}
              >
                {passwordToBeChanged
                  ? <Input.Password />
                  : <Typography.Link onClick={() => setPasswordToBeChanged(true)}>Change</Typography.Link>}
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                  {I18n.t('common.actions.update')}
                </Button>
                <TestConnection settings={settings} clientId={clientId} />
              </Space>
            </>
          )}
        </ResourceForm>
      </Col>
    </Row>
  )
}

const TestConnection: React.FC<{ settings: ClientAuditlogExportSetting, clientId: string }> = (
  { settings, clientId },
) => {
  const [isLoading, setIsLoading] = useState(false)
  const { memberAction } = useResources<ClientAuditlogExportSetting>('client_auditlog_export_settings', {
    responseType: ClientAuditlogExportSettingtTR,
    basePath: `clients/${clientId}`,
  })
  const { message } = App.useApp()

  const handleTestConnection = () => {
    setIsLoading(true)

    return memberAction({
      action: 'test_connection',
      method: 'post',
      id: settings.id,
    }).then(() => {
      message.success(I18n.t('admin.settings_siem_send_test_log_success_message'))
      setIsLoading(false)
    }).catch(() => {
      message.error(I18n.t('admin.settings_siem_send_test_log_error_message'))
      setIsLoading(false)
    })
  }

  return (
    <Button
      icon={<MailOutlined />}
      loading={isLoading}
      onClick={() => handleTestConnection()}
    >
      {I18n.t('admin.settings_siem_send_test_log')}
    </Button>
  )
}
