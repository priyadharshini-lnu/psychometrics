import React from 'react'
import {
  Form, Layout, Typography, Row, Col, Space, Button, Image, Alert,
  Input,
} from 'antd'
import { AccessiblePasswordInput, DirectionalArrowIcon } from '~/glint'
import { useResources } from '~/hooks/useResources'
import { UserDetails } from '~/modules/admin/modules/client/core/users'
import ResourceForm from '~/components/ResourceForm'
import styles from './ChangePassword.less'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { SuccessMessageTR } from '~/modules/admin/modules/client/core/successMessage'
import illustration from '../../assets/images/ChangePassword.png'
import { useRecaptcha } from '~/hooks/useRecaptcha'

const { I18n } = window
const { disable_recaptcha } = window.PsyGlobalState.features

const ChangePassword: React.FC = () => {
  const { collectionAction } = useResources<UserDetails>('users')

  const [form] = Form.useForm()

  const {
    recaptchaToken,
    recaptchaReady,
    recaptchaWidgetId,
    resetRecaptcha,
  } = useRecaptcha({ formInstance: form, disable_recaptcha })

  const updateResource = (body: Record<string, string | undefined | null>) => collectionAction({
    action: 'change_password',
    method: 'post',
    body,
    updateStore: true,
    responseType: SuccessMessageTR,
  })

  const handleChangePassword = values => updateResource(values).then(() => {
    location.href = '/'
  }).catch((error) => {
    resetRecaptcha()
    throw error
  })

  return (
    <>
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin/profile',
            label: () => I18n.t('admin.profile'),
          },
          {
            label: () => I18n.t('admin.profile_change_password'),
          },
        ]}
      />
      <Layout.Content className={styles.pageContent}>
        <Typography.Title level={3}>{I18n.t('admin.profile_change_password')}</Typography.Title>
        <Row gutter={32} align="middle">
          <Col xs={24} lg={12} xl={6}>
            <Image src={illustration} preview={false} />
          </Col>
          <Col xs={24} lg={12} xl={6}>
            <ResourceForm
              resourceName="users"
              storeManager={{ form }}
              readableResourceName="User"
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
                    <AccessiblePasswordInput size="large" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label={I18n.t('change_password_page.password')}
                  >
                    <AccessiblePasswordInput size="large" />
                  </Form.Item>
                  <Form.Item
                    name="passwordConfirmation"
                    label={I18n.t('change_password_page.password_confirmation')}
                  >
                    <AccessiblePasswordInput size="large" />
                  </Form.Item>
                  {!disable_recaptcha && (
                    <Form.Item
                      name="recaptcha_token"
                      style={{ display: 'none' }}
                    >
                      <Input type="hidden" />
                    </Form.Item>
                  )

                  }
                  <>
                    <Alert message={I18n.t('change_password_page.warning_message')} type="warning" />
                  </>
                  <Space align="baseline" size="middle" className={styles.buttonSpaceContainer}>

                    <Button
                      type="primary"
                      size="large"
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
                      {I18n.t('shared.update')}
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

export default ChangePassword
