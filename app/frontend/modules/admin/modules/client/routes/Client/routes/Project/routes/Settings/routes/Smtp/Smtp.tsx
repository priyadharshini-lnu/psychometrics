import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import {
  Row, Col, Form, Input, Button, Switch, Radio, Space, App, Skeleton,
} from 'antd'
import { useParams } from 'react-router-dom'
import { MailOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  get as getSmtpSetting,
  SAVE_SETTINGS,
  VALIDATE_SETTINGS,
  saveSettings,
  validateSettings,
  State as SmtpSetting,
} from '~/modules/admin/modules/client/core/smtpSetting'
import { FETCH_SINGLE as FETCH_PROJECT } from '~/modules/admin/modules/client/core/projects'
import { useUpdateEffect } from '~/hooks/useUpdateEffect'
import ResourceForm from '~/components/ResourceForm'
import { isRequestInProgress } from '~/core/request'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { TestSettingModal } from './TestSettingModal'
import { TestEmailModal } from './TestEmailModal'

const connector = connect(
  (state: RootState) => ({
    isProjectLoading: isRequestInProgress(state, FETCH_PROJECT),
    smtpSetting: getSmtpSetting(state),
    isUpdating: isRequestInProgress(state, SAVE_SETTINGS),
    isValidating: isRequestInProgress(state, VALIDATE_SETTINGS),
  }),
  {
    openModal,
    saveSettings,
    validateSettings,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

const { I18n } = window

const ENCRYPTION_TO_PORT_MAPPING = {
  none: 25,
  ssl: 465,
  tls: 465,
}

const MODALS = {
  TestSettingModal,
  TestEmailModal,
}

const SmtpComponent: React.FC<Props> = ({
  smtpSetting, isUpdating, isValidating, saveSettings, validateSettings, openModal, isProjectLoading,
}) => {
  const [form] = Form.useForm()
  const { projectId } = useParams() as { projectId: string }
  const parsedProjectId = parseInt(projectId, 10)
  const { message } = App.useApp()
  const enabled = Form.useWatch('enabled', form)

  enum SubmitFormType {
    None = 'none',
    Validation = 'validation',
    Update = 'update'
  }
  const [submitFormFor, setSubmitFormFor] = useState<SubmitFormType>(SubmitFormType.None)
  const useSenderVerification = Form.useWatch('useSenderVerification', form)

  useUpdateEffect(() => {
    if (submitFormFor !== SubmitFormType.None) { form.submit() }
  }, [submitFormFor])

  const handleEncryptionChange = (encryption: string) => {
    const port = ENCRYPTION_TO_PORT_MAPPING[encryption]
    form.setFieldsValue({ port })
  }

  const formSubmitRequest = (values: Partial<SmtpSetting> & { authentication?: boolean }) => {
    if (values.useSenderVerification) {
      const fieldsToRemove: Array<keyof SmtpSetting | 'authentication'> = [
        'host', 'port', 'userName', 'password', 'encryption', 'authenticationType', 'authentication',
      ]
      fieldsToRemove.forEach(field => delete values[field as keyof typeof values])
    }
    if (submitFormFor === SubmitFormType.Validation) {
      return validateSettings(parsedProjectId, values).then(() => {
        openModal('TestSettingModal', { projectId, smtpSetting: form.getFieldsValue(true) })
      }).finally(() => setSubmitFormFor(SubmitFormType.None))
    }

    if (values.enabled) {
      return validateSettings(parsedProjectId, values).then(() => {
        openModal('TestEmailModal', { projectId, smtpSetting: form.getFieldsValue(true) })
      }).finally(() => setSubmitFormFor(SubmitFormType.None))
    }

    return saveSettings(parsedProjectId, smtpSetting.id, values).then(() => {
      message.success(I18n.t('admin.smtp_settings_update_success_msg'))
    }).finally(() => setSubmitFormFor(SubmitFormType.None))
  }

  if (isProjectLoading) return <Skeleton />

  return (
    <Row justify="space-between" className="pl">
      <Col sm={24} md={16} xl={12} xxl={10}>
        <ResourceForm
          resourceName="smtpSettings"
          requestScope="campaigns"
          resourceBaseUrl={`/administration/projects/${projectId}/smtp_settings`}
          resource={smtpSetting}
          storeManager={{ form }}
          request={{
            submit: formSubmitRequest,
          }}
          formProps={{
            layout: 'horizontal',
            labelCol: {
              sm: 24, md: 10, lg: 8, xl: 8,
            },
            labelAlign: 'left',
            initialValues: { authentication: !isEmpty(smtpSetting.userName), useSenderVerification: false },
            onValuesChange: (changedValues) => {
              if (changedValues.encryption) { handleEncryptionChange(changedValues.encryption) }
              if (changedValues.authentication) { form.setFieldsValue({ authenticationType: 'plain' }) }
            },
          }}
        >
          {({ form }) => (
            <>
              <Form.Item
                name="enabled"
                label={I18n.t('admin.smtp_settings_enabled')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="fromName"
                label={I18n.t('admin.smtp_settings_from_name')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="fromEmail"
                label={I18n.t('admin.smtp_settings_from_email')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="useSenderVerification"
                label={I18n.t('admin.smtp_settings_use_sender_verification')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              {!useSenderVerification && <SMTPAuthSettings form={form} />}

              <Space>
                <Button
                  type="primary"
                  loading={!enabled && isUpdating}
                  onClick={() => { setSubmitFormFor(SubmitFormType.Update) }}
                >
                  {I18n.t('common.actions.update')}
                </Button>
                <Button
                  icon={<MailOutlined />}
                  loading={submitFormFor === SubmitFormType.Validation && isValidating}
                  onClick={() => { setSubmitFormFor(SubmitFormType.Validation) }}
                >
                  {I18n.t('admin.smtp_settings_send_test_email')}
                </Button>
              </Space>
            </>
          )}
        </ResourceForm>
      </Col>
      <Modals modals={MODALS} />
    </Row>
  )
}

const SMTPAuthSettings = ({ form }) => (
  <>
    <Form.Item
      name="host"
      label={I18n.t('admin.smtp_settings_host')}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name="encryption"
      label={I18n.t('admin.smtp_settings_encryption')}
    >
      <Radio.Group>
        <Radio value="none">{I18n.t('admin.smtp_settings_encryption_types_none')}</Radio>
        <Radio value="ssl">{I18n.t('admin.smtp_settings_encryption_types_ssl')}</Radio>
        <Radio value="tls">{I18n.t('admin.smtp_settings_encryption_types_tls')}</Radio>
      </Radio.Group>
    </Form.Item>

    <Form.Item
      name="port"
      label={I18n.t('admin.smtp_settings_port')}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name="authentication"
      label={I18n.t('admin.smtp_settings_authentication')}
      valuePropName="checked"
    >
      <Switch />
    </Form.Item>

    {form.getFieldValue('authentication')
      && (
        <>
          <Form.Item
            name="authenticationType"
            label={I18n.t('admin.smtp_settings_authentication_type')}
          >
            <Radio.Group>
              <Radio value="plain">
                {I18n.t('admin.smtp_settings_authentication_types_plain')}
              </Radio>
              <Radio value="login">
                {I18n.t('admin.smtp_settings_authentication_types_login')}
              </Radio>
              <Radio value="cram_md5">
                {I18n.t('admin.smtp_settings_authentication_types_cram_md5')}
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="userName"
            label={I18n.t('admin.smtp_settings_user_name')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label={I18n.t('admin.smtp_settings_password')}
          >
            <Input.Password />
          </Form.Item>
        </>
      )
    }
  </>
)

export const Smtp = connector(SmtpComponent)
