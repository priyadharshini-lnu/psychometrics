import { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  PageContainer,
  Row,
  Typography,
  useDirection,
} from '@thetalententerprise/glint'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@thetalententerprise/glint/icons'
import ResourceForm from '~/components/ResourceForm'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { changePassword } from '~/core/currentUser'
import { useRecaptcha } from '~/hooks/useRecaptcha'
import { getSecuritySettings } from '~/modules/endUser/core/config'

const { I18n } = window
const { disable_recaptcha } = window.PsyGlobalState.features

const connector = connect(
  (state: RootState) => ({
    enabledRecaptchaAtProject: getSecuritySettings(state).enableRecaptcha,
  }),
  { changePassword },
)

type PropsFromRedux = ConnectedProps<typeof connector>

// Whole-page glint swap for `/change_password`: the legacy ResourceForm/recaptcha
// plumbing inside the shared UserPage chrome. A successful change signs the user out.
export const ChangePasswordPageComponent: FC<PropsFromRedux> = ({
  changePassword,
  enabledRecaptchaAtProject,
}) => {
  const [form] = Form.useForm()
  const recaptchaEnabled = !disable_recaptcha && enabledRecaptchaAtProject
  const forwardIcon = useDirection() === 'rtl' ? <ArrowLeftOutlined /> : <ArrowRightOutlined />

  const {
    recaptchaToken,
    recaptchaReady,
    recaptchaWidgetId,
    resetRecaptcha,
  } = useRecaptcha({ formInstance: form, disable_recaptcha: !recaptchaEnabled })

  const handleChangePassword = (values: object) => changePassword(values).then(() => {
    window.location.href = '/users/sign_in'
  }).catch((error: unknown) => {
    resetRecaptcha()
    throw error
  })

  return (
    <>
      <title>{`${I18n.t('change_password_page.title')} - ${I18n.t('frontend.lighthouse_app')}`}</title>
      <PageContainer>
        <Flex vertical gap="large">
          <Typography.Title level={1} style={{ margin: 0 }}>
            {I18n.t('change_password_page.title')}
          </Typography.Title>
          <Row>
            <Col xs={24} lg={14}>
              <Card>
                <ResourceForm
                  resourceName="passwords"
                  readableResourceName="Password"
                  storeManager={{ form }}
                  scrollToFirstError
                  request={{ submit: handleChangePassword }}
                >
                  {() => (
                    <Flex vertical gap="middle">
                      <Form.Item
                        name="currentPassword"
                        label={I18n.t('change_password_page.old_password')}
                      >
                        <Input.Password size="large" autoComplete="tte-old-password" />
                      </Form.Item>
                      <Form.Item
                        name="password"
                        label={I18n.t('change_password_page.password')}
                      >
                        <Input.Password size="large" autoComplete="tte-new-password" />
                      </Form.Item>
                      <Form.Item
                        name="passwordConfirmation"
                        label={I18n.t('change_password_page.password_confirmation')}
                      >
                        <Input.Password size="large" />
                      </Form.Item>

                      {recaptchaEnabled ? (
                        <Form.Item name="recaptcha_token" style={{ display: 'none' }}>
                          <Input type="hidden" />
                        </Form.Item>
                      ) : null}

                      <Alert type="warning" message={I18n.t('enduser.change_password_warning')} />

                      <Flex justify="flex-end">
                        <Button
                          scheme="primary"
                          variant="solid"
                          size="large"
                          htmlType="submit"
                          icon={forwardIcon}
                          iconPlacement="end"
                          onClick={(e) => {
                            if (!recaptchaEnabled) return
                            if (!recaptchaReady || recaptchaWidgetId.current === null) {
                              e.preventDefault()
                              return
                            }
                            if (!recaptchaToken) {
                              e.preventDefault()
                              window.grecaptcha.execute(recaptchaWidgetId.current)
                            }
                          }}
                        >
                          {I18n.t('profile.update')}
                        </Button>
                      </Flex>
                    </Flex>
                  )}
                </ResourceForm>
                {recaptchaEnabled ? <div id="recaptcha-button" style={{ display: 'none' }} /> : null}
              </Card>
            </Col>
          </Row>
        </Flex>
      </PageContainer>
    </>
  )
}

export const ChangePasswordPage = connector(ChangePasswordPageComponent)

export default ChangePasswordPage
