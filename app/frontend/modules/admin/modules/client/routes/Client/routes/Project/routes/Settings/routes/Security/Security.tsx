import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Form, Input, Button, Switch, Select, Skeleton,
} from 'antd'
import { useParams } from 'react-router-dom'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  get as getPasswordSetting,
  saveSettings,
  SAVE_SETTINGS,
} from '~/modules/admin/modules/client/core/securitySetting'
import { FETCH_SINGLE as FETCH_PROJECT } from '~/modules/admin/modules/client/core/projects'
import ResourceForm from '~/components/ResourceForm'
import { isRequestInProgress } from '~/core/request'
import InputDuration from '~/components/InputDuration'

const connector = connect(
  (state: RootState) => ({
    isProjectLoading: isRequestInProgress(state, FETCH_PROJECT),
    securitySetting: getPasswordSetting(state),
    isSaving: isRequestInProgress(state, SAVE_SETTINGS),
  }),
  {
    saveSettings,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

const { I18n } = window
const { disable_recaptcha } = window.PsyGlobalState.features

const securityComponent: React.FC<Props> = ({
  securitySetting, isSaving, isProjectLoading,
}) => {
  const [form] = Form.useForm()
  const { projectId } = useParams() as { projectId: string }

  useEffect(() => {
    form.setFieldsValue(securitySetting)
  }, [])

  if (isProjectLoading) return <Skeleton />

  return (
    <Row justify="space-between" className="pl">
      <Col sm={24} md={18} xl={14} xxl={12}>
        <ResourceForm
          resourceName="passwordSetting"
          requestScope="campaigns"
          resourceBaseUrl={`/administration/projects/${projectId}/security_settings`}
          resource={securitySetting}
          storeManager={{ form }}
          readableResourceName={I18n.t('administration.security_settings.security_setting')}
          showSuccessMessages
          formProps={{
            layout: 'horizontal',
            labelCol: {
              sm: 24, md: 12, lg: 12, xl: 12,
            },
            labelAlign: 'left',
          }}
        >
          {({ form }) => {
            const lock = form.getFieldValue('lockAccount')
            const redirect_enabled = form.getFieldValue('externalLogoutRedirectEnabled')
            return (
              <>
                <Form.Item
                  name="enforceStrongPassword"
                  label={I18n.t('administration.security_setting.enforce_strong')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="minPasswordLength"
                  label={I18n.t('administration.security_setting.min_length')}
                  required
                >
                  <Input type="number" defaultValue={8} min={8} max={20} />
                </Form.Item>
                <Form.Item
                  name="enforcePasswordPolicy"
                  label={I18n.t('administration.security_setting.enforce_password_policy')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="disablePasswordReuse"
                  label={I18n.t('administration.security_setting.disable_password_reuse')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="passwordExpiration"
                  label={I18n.t('administration.security_setting.expiration')}
                >
                  <Select defaultValue={securitySetting.passwordExpiration || 'never'}>
                    <Select.Option value={null}>{I18n.t('administration.security_setting.never')}</Select.Option>
                    <Select.Option value={30}>{I18n.t('administration.security_setting.30_days')}</Select.Option>
                    <Select.Option value={90}>{I18n.t('administration.security_setting.90_days')}</Select.Option>
                    <Select.Option value={180}>{I18n.t('administration.security_setting.180_days')}</Select.Option>
                    <Select.Option value={365}>{I18n.t('administration.security_setting.365_days')}</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="restrictSequences"
                  label={I18n.t('administration.security_setting.restrict_sequences')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="tfaEnabled"
                  label={I18n.t('administration.security_setting.tfa_enabled')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="lockAccount"
                  label={I18n.t('administration.security_setting.lock_account')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                {lock && (
                  <>
                    <Form.Item
                      name="attemptsToLock"
                      label={I18n.t('administration.security_setting.attempts_to_lock')}
                    >
                      <Select defaultValue={securitySetting.attemptsToLock || 3}>
                        <Select.Option value="3">3</Select.Option>
                        <Select.Option value="5">5</Select.Option>
                        <Select.Option value="10">10</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="autoUnlockTime"
                      label={I18n.t('administration.security_setting.auto_unlock_time')}
                    >
                      <Select defaultValue={securitySetting.autoUnlockTime || 15}>
                        <Select.Option value={2}>2 mins</Select.Option>
                        <Select.Option value={5}>5 mins</Select.Option>
                        <Select.Option value={10}>10 mins</Select.Option>
                        <Select.Option value={15}>15 mins</Select.Option>
                        <Select.Option value={30}>30 mins</Select.Option>
                        <Select.Option value={60}>1 hour</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="sendUnlockEmail"
                      label={I18n.t('administration.security_setting.send_unlock_email')}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </>
                )}
                <Form.Item
                  name="magicLinkExpiryInSeconds"
                  label={I18n.t('administration.security_setting.magic_link_expiry_duration')}
                  required
                >
                  <InputDuration placeholder={I18n.t('administration.components.input_duration.placeholder')} />
                </Form.Item>
                <Form.Item
                  name="sessionInactivityTimeoutInSeconds"
                  label={I18n.t('administration.security_setting.session_timeout_duration')}
                  required
                >
                  <InputDuration placeholder={I18n.t('administration.components.input_duration.placeholder')} />
                </Form.Item>
                <Form.Item
                  name="magicLinkEnabled"
                  label={I18n.t('administration.security_setting.enable_login_with_magic_link')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="disallowPasswordLogin"
                  label={I18n.t('administration.security_setting.disallow_password_login')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="externalLogoutRedirectEnabled"
                  label={I18n.t('admin.permissions.projectSettings.external_logout_redirect_enabled')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                {redirect_enabled && (
                  <>
                    <Form.Item
                      name="externalLogoutUrl"
                      label={I18n.t('admin.permissions.projectSettings.external_logout_url')}
                      required
                    >
                      <Input />
                    </Form.Item>
                  </>
                )}

                {!disable_recaptcha && (
                  <Form.Item
                    name="enableRecaptcha"
                    label={I18n.t('administration.security_setting.enable_recaptcha')}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                )
                }

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSaving}
                  className="mb-16"
                >
                  {I18n.t('administration.save')}
                </Button>
              </>
            )
          }}
        </ResourceForm>
      </Col>
    </Row>
  )
}

export const SecuritySettings = connector(securityComponent)
