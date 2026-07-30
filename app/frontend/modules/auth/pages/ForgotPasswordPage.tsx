import React, { useRef } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  AuthTemplate, Form, Button, Flex,
} from '@thetalententerprise/glint'
import type { AuthAlertItem } from '@thetalententerprise/glint'
import { useRecaptcha } from '~/hooks/useRecaptcha'
import { RootState } from '../core/reducers'
import { buildAuthChrome } from './AuthChrome'
import { AuthField } from './AuthField'
import { flashAlerts } from './flashAlerts'

const { I18n } = window
const { disable_recaptcha } = window.PsyGlobalState.features

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const ForgotPasswordPageComponent: React.FC<Props> = ({
  projectConfig, csrfToken, user, errors, flash,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null)
  const navigate = useNavigate()
  const adminSide = projectConfig.id === undefined
  const signInPath = adminSide ? '/administration/sign_in' : '/users/sign_in'
  const recaptchaEnabled = !disable_recaptcha && (adminSide || Boolean(projectConfig.enable_recaptcha))

  const { recaptchaToken, recaptchaReady, recaptchaWidgetId } = useRecaptcha({
    formRef,
    disable_recaptcha: !recaptchaEnabled,
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    formRef.current = e.currentTarget
    if (!recaptchaEnabled) return
    if (!recaptchaReady || recaptchaWidgetId.current === null) {
      e.preventDefault()
      return
    }
    if (!recaptchaToken) {
      e.preventDefault()
      window.grecaptcha.execute(recaptchaWidgetId.current)
    }
  }

  // A token in state means the set-password screen, which stays on the legacy tree; never show this form empty.
  if (user.reset_password_token) return <Navigate to={signInPath} replace />

  const alerts: AuthAlertItem[] = [
    ...flashAlerts(flash),
    ...(errors.base || []).map(value => ({ type: 'error' as const, message: value })),
  ]

  const { brand, feature, footer } = buildAuthChrome(projectConfig)

  return (
    <>
      <AuthTemplate
        brand={brand}
        feature={feature}
        footer={footer}
        title={I18n.t('auth.reset_password.title')}
        subtitle={I18n.t('auth.reset_password.description')}
        alerts={alerts}
      >
        <form
          id="form-reset"
          action={adminSide ? '/administration/passwords' : '/users/password'}
          method="post"
          onSubmit={handleSubmit}
          ref={formRef}
        >
          <input type="hidden" name="authenticity_token" value={csrfToken} />
          {recaptchaEnabled && <input type="hidden" name="recaptcha_token" value={recaptchaToken} />}
          <Form component={false} layout="vertical">
            <AuthField
              id="reset-email"
              name="user[email]"
              label={I18n.t('auth.email')}
              type="email"
              placeholder={I18n.t('auth.email_placeholder')}
              defaultValue={user.email}
              autoComplete="email"
              error={errors.email}
            />
            <Button scheme="primary" variant="solid" size="large" htmlType="submit" block>
              {I18n.t('auth.reset_password.submit')}
            </Button>
            <Flex justify="center" style={{ marginBlockStart: 16 }}>
              <Button
                scheme="primary"
                variant="link"
                href={signInPath}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault()
                  navigate(signInPath)
                }}
              >
                {I18n.t('auth.reset_password.back_to_sign_in')}
              </Button>
            </Flex>
          </Form>
        </form>
      </AuthTemplate>
      {recaptchaEnabled && <div id="recaptcha-button" style={{ display: 'none' }} />}
    </>
  )
}

const connector = connect((state: RootState) => state, {})

export const ForgotPasswordPage = connector(ForgotPasswordPageComponent)

export default ForgotPasswordPage
