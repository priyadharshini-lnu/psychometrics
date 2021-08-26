import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import {
  Row, Col, Form, Input, Button, Switch, Radio,
} from 'antd'
import { MailOutlined } from '@ant-design/icons'
import { RootState } from 'modules/admin/core/rootReducers'
import {
  get as getSmtpSetting,
  UPDATE,
} from 'modules/admin/modules/projects/core/smtpSetting'
import { useParams } from 'react-router-dom'
import ResourceForm from 'components/ResourceForm'
import { isRequestInProgress } from 'modules/admin/core/request'
import Modals from 'modules/admin/components/Modals'
import { openModal } from 'modules/admin/core/ui/modals'
import { TestSettingModal } from './TestSettingModal'

const connector = connect(
  (state: RootState) => ({
    smtpSetting: getSmtpSetting(state),
    isUpdating: isRequestInProgress(state, UPDATE),
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

const { I18n } = window

const ENCRYPTION_TO_PORT_MAPPIN = {
  none: 25,
  ssl: 465,
  tls: 465,
}

const MODALS = {
  TestSettingModal,
}

const SmtpComponent: React.FC<Props> = ({ smtpSetting, isUpdating, openModal }) => {
  const [form] = Form.useForm()
  const { projectId } = useParams<{ projectId: string }>()

  const handleEncryptionChange = (encryption: string) => {
    const port = ENCRYPTION_TO_PORT_MAPPIN[encryption]
    form.setFieldsValue({ port })
  }

  return (
    <Row justify="space-between" className="pl">
      <Col sm={24} md={8}>
        <div style={{ height: '24px' }}>
          <Button
            onClick={() => {
              openModal('TestSettingModal', { projectId, smtpSettingId: smtpSetting.id })
            }}
            icon={<MailOutlined />}
            className="float-r"
          >
            {I18n.t('administration.smtp_settings.test_settings')}
          </Button>
        </div>
        <ResourceForm
          resourceName="smtpSetting"
          requestScope="campaigns"
          resourceBaseUrl={`/administration/projects/${projectId}/smtp_settings`}
          resource={smtpSetting}
          storeManager={{ form }}
          showSuccessMessages
          formProps={{
            layout: 'horizontal',
            labelCol: {
              sm: 24, md: 10, lg: 8, xl: 8,
            },
            labelAlign: 'left',
            initialValues: { authentication: !isEmpty(smtpSetting.userName) },
            onValuesChange: (changedValues) => {
              if (changedValues.encryption) { handleEncryptionChange(changedValues.encryption) }
            },
          }}
        >
          {({ form }) => (
            <>
              <Form.Item
                name="enabled"
                label={I18n.t('administration.smtp_settings.enabled')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="fromName"
                label={I18n.t('administration.smtp_settings.from_name')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="fromEmail"
                label={I18n.t('administration.smtp_settings.from_email')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="host"
                label={I18n.t('administration.smtp_settings.host')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="encryption"
                label={I18n.t('administration.smtp_settings.encryption')}
              >
                <Radio.Group>
                  <Radio value="none">{I18n.t('administration.smtp_settings.encryption_types.none')}</Radio>
                  <Radio value="ssl">{I18n.t('administration.smtp_settings.encryption_types.ssl')}</Radio>
                  <Radio value="tls">{I18n.t('administration.smtp_settings.encryption_types.tls')}</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="port"
                label={I18n.t('administration.smtp_settings.port')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="authentication"
                label={I18n.t('administration.smtp_settings.authentication')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              {form.getFieldValue('authentication')
                && (
                  <>
                    <Form.Item
                      name="authenticationType"
                      label={I18n.t('administration.smtp_settings.authentication_type')}
                    >
                      <Radio.Group>
                        <Radio value="plain">
                          {I18n.t('administration.smtp_settings.authentication_types.plain')}
                        </Radio>
                        <Radio value="login">
                          {I18n.t('administration.smtp_settings.authentication_types.login')}
                        </Radio>
                        <Radio value="cram_md5">
                          {I18n.t('administration.smtp_settings.authentication_types.cram_md5')}
                        </Radio>
                      </Radio.Group>
                    </Form.Item>

                    <Form.Item
                      name="userName"
                      label={I18n.t('administration.smtp_settings.user_name')}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      label={I18n.t('administration.smtp_settings.password')}
                    >
                      <Input.Password />
                    </Form.Item>
                  </>
                )
              }
              <Button type="primary" htmlType="submit" loading={isUpdating}>{I18n.t('common.actions.update')}</Button>
            </>
          )}
        </ResourceForm>
      </Col>
      <Modals modals={MODALS} />
    </Row>
  )
}

export const Smtp = connector(SmtpComponent)
