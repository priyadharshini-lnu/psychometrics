import {
  Alert, Button, Card, Flex, Form, Input,
} from '@thetalententerprise/glint'
import { AccessiblePasswordInput, DirectionalArrowIcon } from '~/glint'
import { useResources } from '~/hooks/useResources'
import { UserDetails } from '~/modules/admin/modules/client/core/users'
import ResourceForm from '~/components/ResourceForm'
import { SuccessMessageTR } from '~/modules/admin/modules/client/core/successMessage'
import { useRecaptcha } from '~/hooks/useRecaptcha'

const { I18n } = window
const { disable_recaptcha } = window.PsyGlobalState.features

function ChangePassword () {
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
    <Card>
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
              <AccessiblePasswordInput />
            </Form.Item>
            <Form.Item
              name="password"
              label={I18n.t('change_password_page.password')}
            >
              <AccessiblePasswordInput />
            </Form.Item>
            <Form.Item
              name="passwordConfirmation"
              label={I18n.t('change_password_page.password_confirmation')}
            >
              <AccessiblePasswordInput />
            </Form.Item>
            {!disable_recaptcha && (
              <Form.Item name="recaptcha_token" hidden>
                <Input type="hidden" />
              </Form.Item>
            )}
            <Flex vertical gap="middle">
              <Alert title={I18n.t('change_password_page.warning_message')} type="warning" />
              <Flex justify="end">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<DirectionalArrowIcon aria-label="" />}
                  iconPlacement="end"
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
                </Button>
              </Flex>
            </Flex>
          </>
        )}
      </ResourceForm>
      {/* grecaptcha renders its invisible widget into this container, so it must exist but never show. */}
      {!disable_recaptcha && <div id="recaptcha-button" hidden />}
    </Card>
  )
}

export default ChangePassword
