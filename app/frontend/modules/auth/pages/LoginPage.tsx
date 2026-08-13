import React, { useRef } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
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

const getFormAction = (isMagicOnly: boolean, isEmailStep: boolean) => {
  if (isMagicOnly) return '/users/magic_links/sign_in'
  if (isEmailStep) return '/users/check_sso'
  return '/users/sign_in'
}

const getSubmitBtnText = (isMagicOnly: boolean, isEmailStep: boolean) => {
  if (isMagicOnly) return I18n.t('auth.login.magic_link_btn')
  if (isEmailStep) return I18n.t('auth.login.continue_btn')
  return I18n.t('enduser.login_sign_in_btn')
}

const showDivider = (projectConfig: RootState['projectConfig']) => {
  if (projectConfig.disallow_password_login) return false
  const ssoButtonVisible = projectConfig.saml_login_allowed && !projectConfig.saml_enforced
  return (projectConfig.magic_link_enabled || ssoButtonVisible)
}

const LoginPageComponent: React.FC<Props> = ({
  projectConfig, csrfToken, user, errors, flash,
}) => {
  const recaptchaEnabled = !disable_recaptcha && projectConfig.enable_recaptcha
  const formRef = useRef<HTMLFormElement | null>(null)
  const navigate = useNavigate()

  const isTwoStepFlow = projectConfig.saml_login_allowed && projectConfig.saml_domain_enforcement_enabled
  const isEmailStep = isTwoStepFlow && !user.email

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

  const showPasswordForm = !projectConfig.saml_enforced && !projectConfig.disallow_password_login
  const isMagicOnly = projectConfig.disallow_password_login
  const alerts: AuthAlertItem[] = [
    ...flashAlerts(flash),
    ...(errors.base || []).map(value => ({ type: 'error' as const, title: value })),
  ]

  const { brand, feature, footer } = buildAuthChrome(projectConfig)
  const spaLink = (to: string) => ({
    href: to,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault()
      navigate(to)
    },
  })

  const secondaryActions = (projectConfig.saml_login_allowed || projectConfig.magic_link_enabled) ? (
    <>
      {projectConfig.saml_login_allowed && (
        <Button
          scheme="primary"
          variant={projectConfig.saml_enforced ? 'solid' : 'outlined'}
          size="large"
          href="/users/saml/sign_in"
          block
        >
          {I18n.t('auth.login.sso_btn')}
        </Button>
      )}
      {projectConfig.magic_link_enabled && (
        <Link to="/users/magic_links/sign_in">
          <Button scheme="primary" variant="outlined" size="large" block>{I18n.t('auth.login.magic_link_btn')}</Button>
        </Link>
      )}
    </>
  ) : undefined

  const prompt = showPasswordForm && !projectConfig.hide_signup ? (
    <>
      {`${I18n.t('auth.login.not_member')} `}
      <Button scheme="primary" variant="link" {...spaLink('/users/sign_up')}>
        {I18n.t('enduser.login_sign_up_link')}
      </Button>
    </>
  ) : undefined

  const formAction = getFormAction(isMagicOnly, isEmailStep)
  const submitBtnText = getSubmitBtnText(isMagicOnly, isEmailStep)

  const formNode = (showPasswordForm || isMagicOnly) ? (
    <form
      id={showPasswordForm ? 'form-login' : 'form-magic'}
      action={formAction}
      method="post"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      {recaptchaEnabled && <input type="hidden" name="recaptcha_token" value={recaptchaToken} />}
      <Form component={false} layout="vertical">
        <AuthField
          id={isMagicOnly ? 'magic-email' : 'email'}
          name="user[email]"
          label={I18n.t('auth.email')}
          type="email"
          placeholder={I18n.t('auth.email_placeholder')}
          defaultValue={user.email}
          autoComplete={isMagicOnly ? 'email' : 'tte-user-email'}
          error={errors.email}
          disabled={isTwoStepFlow && !isEmailStep}
        />
        {isTwoStepFlow && !isEmailStep && (
          <input type="hidden" name="user[email]" value={user.email} />
        )}
        {showPasswordForm && !isEmailStep ? (
          <AuthField
            id="password"
            name="user[password]"
            label={I18n.t('auth.password')}
            placeholder={I18n.t('auth.password_placeholder')}
            autoComplete="tte-user-password"
            error={errors.password}
            secure
          />
        ) : null}
        {showPasswordForm && !isEmailStep ? (
          <Flex justify="flex-end" style={{ marginBlockEnd: 12 }}>
            <Button scheme="primary" variant="link" {...spaLink('/users/password/new')}>
              {I18n.t('auth.login.forgot_password')}
            </Button>
          </Flex>
        ) : null}
        <Button scheme="primary" variant="solid" size="large" htmlType="submit" block>
          {submitBtnText}
        </Button>
      </Form>
    </form>
  ) : undefined

  return (
    <>
      <AuthTemplate
        brand={brand}
        feature={feature}
        footer={footer}
        title={I18n.t('enduser.login_welcome_title')}
        subtitle={I18n.t('enduser.login_welcome_description')}
        alerts={alerts}
        secondaryActions={secondaryActions}
        dividerLabel={showDivider(projectConfig) ? I18n.t('auth.login.or') : undefined}
        prompt={prompt}
      >
        {formNode}
      </AuthTemplate>
      {recaptchaEnabled && <div id="recaptcha-button" style={{ display: 'none' }} />}
    </>
  )
}

const connector = connect((state: RootState) => state, {})

export const LoginPage = connector(LoginPageComponent)

export default LoginPage
