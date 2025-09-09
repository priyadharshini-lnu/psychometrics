import React from 'react'
import {
  Form, Layout, Typography, Row, Col, Space, Button, Alert, Input,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { DirectionalArrowIcon, PageHeader as GlintPageHeader, AccessiblePasswordInput } from '~/glint'
import ResourceForm from '~/components/ResourceForm'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { changePassword, CHANGE_PASSWORD } from '~/core/currentUser'
import { isRequestInProgress } from '~/core/request'
import styles from './ChangePassword.less'
import { useRecaptcha } from '~/hooks/useRecaptcha'

const { I18n } = window
const { disable_recaptcha } = window.PsyGlobalState.features

const connecter = connect((state: RootState) => ({
  saveInProgress: isRequestInProgress(state, CHANGE_PASSWORD),
}),
{
  changePassword,
})

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ChangePasswordComponent: React.FC<Props> = ({ changePassword, saveInProgress }) => {
  const [form] = Form.useForm()

  const {
    recaptchaToken,
    recaptchaReady,
    recaptchaWidgetId,
  } = useRecaptcha({ formInstance: form, disable_recaptcha })

  const handleChangePassword = values => changePassword(values).then(() => {
    window.location.href = '/users/sign_in'
  })

  return (
    <>
      <title>
        {
          `${I18n.t('campaign.dashboard_menu.profile')} ${I18n.t('change_password_page.title')}
          - ${I18n.t('frontend.lighthouse_app')}
          `
        }
      </title>
      <GlintPageHeader />
      <Layout.Content className={styles.pageContent}>
        <Typography.Title level={1} className={styles.title}>{I18n.t('change_password_page.title')}</Typography.Title>
        <Row>
          <Col xs={24} lg={12} xl={6}>
            <ResourceForm
              resourceName="passwords"
              readableResourceName="Password"
              storeManager={{ form }}
              scrollToFirstError
              request={{
                submit: handleChangePassword,
              }}
            >
              {() => (
                <>
                  <Form.Item
                    name="currentPassword"
                    label={I18n.t('change_password_page.old_password')}
                  >
                    <AccessiblePasswordInput autoComplete="tte-old-password" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label={I18n.t('change_password_page.password')}
                  >
                    <AccessiblePasswordInput autoComplete="tte-new-password" />
                  </Form.Item>
                  <Form.Item
                    name="passwordConfirmation"
                    label={I18n.t('change_password_page.password_confirmation')}
                  >
                    <AccessiblePasswordInput />
                  </Form.Item>

                  {!disable_recaptcha && (
                    <Form.Item
                      name="recaptcha_token"
                      style={{ display: 'none' }}
                    >
                      <Input type="hidden" />
                    </Form.Item>
                  )}
                  <>
                    <Alert
                      message={(
                        <span>
                          <InfoCircleOutlined className={styles.infoIcon} />
                          {I18n.t('change_password_page.warning_message')}
                        </span>
                      )}
                      type="warning"
                    />
                  </>
                  <Space align="baseline" size="middle" className={styles.buttonSpaceContainer}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className={styles.actionButton}
                      onClick={(e) => {
                        if (!disable_recaptcha) {
                          if (!recaptchaReady || recaptchaWidgetId.current === null) {
                            e.preventDefault()
                            return
                          }
                          if (!recaptchaToken) {
                            e.preventDefault()
                            window.grecaptcha.execute(recaptchaWidgetId.current)
                          }
                        }
                      }}
                    >
                      {I18n.t('profile.update')}
                      <DirectionalArrowIcon className={styles.buttonIcon} />
                    </Button>
                  </Space>
                </>
              )}
            </ResourceForm>
            {/* Hidden div for reCAPTCHA widget */}
            {!disable_recaptcha && <div id="recaptcha-button" style={{ display: 'none' }} />}
          </Col>
        </Row>
      </Layout.Content>
    </>
  )
}

export const ChangePassword = connecter(ChangePasswordComponent)
