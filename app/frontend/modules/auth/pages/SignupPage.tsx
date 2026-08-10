/* eslint-disable react/no-danger */
import React, { useRef } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  AuthTemplate, Form, Button, Typography,
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

const SignupPageComponent: React.FC<Props> = ({
  csrfToken, user, errors, flash, projectConfig,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null)
  const navigate = useNavigate()

  const { recaptchaToken, recaptchaReady, recaptchaWidgetId } = useRecaptcha({
    formRef,
    disable_recaptcha,
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    formRef.current = e.currentTarget
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('verificationToken_'))
        .forEach(key => localStorage.removeItem(key))
      if (!disable_recaptcha) {
        if (!recaptchaReady || recaptchaWidgetId.current === null) return
        if (!recaptchaToken) {
          e.preventDefault()
          window.grecaptcha.execute(recaptchaWidgetId.current)
        }
      }
    } catch (err) { /* empty */ }
  }

  const alerts: AuthAlertItem[] = [
    ...flashAlerts(flash),
    ...(errors.base || []).map(value => ({ type: 'error' as const, title: value })),
  ]
  const showRegistrationCode = !user.sms_invite_code
    && (!user.registration_code || (errors.registration_code || []).length > 0)

  const { brand, feature, footer } = buildAuthChrome(projectConfig)
  const spaLink = (to: string) => ({
    href: to,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault()
      navigate(to)
    },
  })

  const prompt = (
    <>
      {`${I18n.t('auth.registration.have_account')} `}
      <Button scheme="primary" variant="link" {...spaLink('/users/sign_in')}>
        {I18n.t('enduser.signup_sign_in_link')}
      </Button>
    </>
  )

  const terms = (
    <Typography.Text type="secondary">
      <span
        dangerouslySetInnerHTML={{
          __html: I18n.t('auth.registration.terms_notice', {
            terms_url: `/privacy-statement?lang=${I18n.currentLocale()}`,
          }),
        }}
      />
    </Typography.Text>
  )

  return (
    <>
      <AuthTemplate
        brand={brand}
        feature={feature}
        footer={footer}
        title={I18n.t('auth.registration.title')}
        subtitle={I18n.t('auth.registration.description')}
        alerts={alerts}
        prompt={prompt}
      >
        <form
          id="form-registration"
          action="/users"
          method="post"
          onSubmit={handleSubmit}
          ref={formRef}
        >
          <input type="hidden" name="authenticity_token" value={csrfToken} />
          {!disable_recaptcha && <input type="hidden" name="recaptcha_token" value={recaptchaToken} />}
          {user.sms_invite_code
            ? <input type="hidden" name="user[sms_invite_code]" value={user.sms_invite_code} />
            : null}
          <Form component={false} layout="vertical">
            <AuthField
              id="first_name"
              name="user[first_name]"
              label={I18n.t('auth.registration.first_name')}
              placeholder={I18n.t('auth.registration.first_name_placeholder')}
              defaultValue={user.first_name}
              error={errors.first_name}
            />
            <AuthField
              id="last_name"
              name="user[last_name]"
              label={I18n.t('auth.registration.last_name')}
              placeholder={I18n.t('auth.registration.last_name_placeholder')}
              defaultValue={user.last_name}
              error={errors.last_name}
            />
            <AuthField
              id="signup-email"
              name="user[email]"
              label={I18n.t('auth.email')}
              type="email"
              placeholder={I18n.t('auth.email_placeholder')}
              defaultValue={user.email}
              error={errors.email}
              hint={I18n.t('auth.registration.email_hint')}
            />
            {showRegistrationCode ? (
              <AuthField
                id="registration_code"
                name="user[registration_code]"
                label={I18n.t('auth.registration.registration_code')}
                placeholder={I18n.t('auth.registration.registration_code_placeholder')}
                defaultValue={user.registration_code}
                error={errors.registration_code}
              />
            ) : null}
            <div style={{ marginBlockEnd: 16 }}>{terms}</div>
            <Button scheme="primary" variant="solid" size="large" htmlType="submit" block>
              {I18n.t('auth.sign_up')}
            </Button>
          </Form>
        </form>
      </AuthTemplate>
      {!disable_recaptcha && <div id="recaptcha-button" style={{ display: 'none' }} />}
    </>
  )
}

const connector = connect((state: RootState) => state, {})

export const SignupPage = connector(SignupPageComponent)

export default SignupPage
