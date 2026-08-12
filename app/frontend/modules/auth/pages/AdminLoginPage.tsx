import React, { useRef } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
const { disable_recaptcha, disable_saml_for_admins } = window.PsyGlobalState.features

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const AdminLoginPageComponent: React.FC<Props> = ({
  projectConfig, csrfToken, user, errors, flash,
}) => {
  const clientContext = window.PsyGlobalState?.clientContextData
  const ssoEnabled = Boolean(clientContext?.sso_enabled)
  const ssoEnforced = Boolean(clientContext?.sso_enforced)
  const ssoDomainEnforced = Boolean(clientContext?.sso_domain_enforcement_enabled)
  const isTwoStepFlow = ssoEnabled && ssoDomainEnforced
  const isEmailStep = ((!clientContext && !disable_saml_for_admins) || isTwoStepFlow) && !user.email

  const showPasswordForm = (!isTwoStepFlow && Boolean(clientContext)) || (!clientContext && disable_saml_for_admins)

  const formRef = useRef<HTMLFormElement | null>(null)
  const navigate = useNavigate()
  const recaptchaEnabled = !disable_recaptcha && !isEmailStep

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

  const alerts: AuthAlertItem[] = [
    ...flashAlerts(flash),
    ...(errors.base || []).map(value => ({ type: 'error' as const, title: value })),
  ]

  const { brand, feature, footer } = buildAuthChrome(projectConfig)

  const secondaryActions = ssoEnabled ? (
    <Button
      scheme="primary"
      variant={ssoEnforced ? 'solid' : 'outlined'}
      size="large"
      href="/users/saml/sign_in"
      block
    >
      {I18n.t('auth.login.sso_btn')}
    </Button>
  ) : undefined

  const emailLocked = !isEmailStep && !showPasswordForm

  const formNode = ssoEnforced ? undefined : (
    <form
      id={!isEmailStep ? 'form-login' : 'form-email'}
      action={!isEmailStep ? '/administration' : '/administration/authenticate_user'}
      method="post"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      {recaptchaEnabled && <input type="hidden" name="recaptcha_token" value={recaptchaToken} />}
      {emailLocked && <input type="hidden" name="user[email]" value={user.email} />}
      <Form component={false} layout="vertical">
        <AuthField
          id="email"
          name={emailLocked ? undefined : 'user[email]'}
          label={I18n.t('auth.email')}
          type="email"
          placeholder={I18n.t('auth.email_placeholder')}
          defaultValue={user.email}
          autoComplete={emailLocked ? 'off' : 'tte-user-email'}
          error={errors.email}
          disabled={emailLocked}
        />
        {!isEmailStep ? (
          <AuthField
            id="password"
            name="user[password]"
            label={I18n.t('auth.password')}
            placeholder={I18n.t('auth.password_placeholder')}
            autoComplete={emailLocked ? 'new-password' : 'tte-user-password'}
            error={errors.password}
            secure
          />
        ) : null}
        {!isEmailStep ? (
          <Flex justify="flex-end" style={{ marginBlockEnd: 12 }}>
            <Button
              scheme="primary"
              variant="link"
              href="/administration/passwords/new"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                navigate('/administration/passwords/new')
              }}
            >
              {I18n.t('auth.login.forgot_password')}
            </Button>
          </Flex>
        ) : null}
        <Button scheme="primary" variant="solid" size="large" htmlType="submit" block>
          {!isEmailStep ? I18n.t('auth.login.login_btn') : I18n.t('auth.login.continue_btn')}
        </Button>
      </Form>
    </form>
  )

  return (
    <>
      <AuthTemplate
        brand={brand}
        feature={feature}
        footer={footer}
        title={I18n.t('auth.login.title')}
        subtitle={I18n.t('auth.login.description')}
        alerts={alerts}
        secondaryActions={secondaryActions}
        dividerLabel={ssoEnabled && !ssoEnforced ? I18n.t('auth.login.or') : undefined}
      >
        {formNode}
      </AuthTemplate>
      {recaptchaEnabled && <div id="recaptcha-button" style={{ display: 'none' }} />}
    </>
  )
}

const connector = connect((state: RootState) => state, {})

export const AdminLoginPage = connector(AdminLoginPageComponent)

export default AdminLoginPage
