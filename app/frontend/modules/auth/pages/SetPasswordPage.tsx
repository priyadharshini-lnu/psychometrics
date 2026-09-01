import React, { useRef, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Navigate } from 'react-router-dom'
import {
  AuthTemplate, Form, Button, Flex,
} from '@thetalententerprise/glint'
import type { AuthAlertItem } from '@thetalententerprise/glint'
import { useRecaptcha } from '~/hooks/useRecaptcha'
import { RootState } from '../core/reducers'
import { buildAuthChrome } from './AuthChrome'
import { AuthField } from './AuthField'
import { useFlashToasts } from './useFlashToasts'

const { I18n } = window
const { disable_recaptcha } = window.PsyGlobalState.features

const ADMIN_SIGN_IN_PATH = '/administration/sign_in'

export type SetPasswordVariant = 'invitation' | 'reset' | 'expired'

type OwnProps = { variant: SetPasswordVariant }

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & OwnProps

const SetPasswordPageComponent: React.FC<Props> = ({
  variant, projectConfig, csrfToken, user, errors, flash,
}) => {
  const expired = variant === 'expired'
  const invitation = variant === 'invitation'

  const formRef = useRef<HTMLFormElement | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const recaptchaEnabled = !disable_recaptcha && !expired

  const { recaptchaToken, recaptchaReady, recaptchaWidgetId } = useRecaptcha({
    formRef,
    disable_recaptcha: !recaptchaEnabled,
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (submitting) {
      e.preventDefault()
      return
    }
    formRef.current = e.currentTarget
    setSubmitting(true)
    if (!recaptchaEnabled) return
    if (!recaptchaReady || recaptchaWidgetId.current === null) {
      // Nothing re-triggers this submit, so the post never happens and the button must stop.
      e.preventDefault()
      setSubmitting(false)
      return
    }
    if (!recaptchaToken) {
      e.preventDefault()
      window.grecaptcha.execute(recaptchaWidgetId.current)
    }
  }

  const token = invitation ? user.invitation_token : user.reset_password_token

  // Devise renders the one-time token into the boot payload; with none there is nothing valid to post.
  const redirecting = !expired && !token

  // Held back when redirecting so the flash survives in the store and toasts on the page the user lands on.
  useFlashToasts(flash, !redirecting)

  if (redirecting) return <Navigate to={ADMIN_SIGN_IN_PATH} replace />

  const alerts: AuthAlertItem[] = (errors.base || []).map((value): AuthAlertItem => ({ type: 'error', title: value }))

  const {
    brand, feature, footer, layout, featureFit,
  } = buildAuthChrome(projectConfig)

  let action = '/administration/passwords'
  if (expired) action = '/administration/password_expired'
  if (invitation) action = '/administration/invitations'

  return (
    <>
      <AuthTemplate
        brand={brand}
        feature={feature}
        footer={footer}
        layout={layout}
        featureFit={featureFit}
        title={I18n.t(expired ? 'auth.expired_password.title' : 'auth.set_password.title')}
        subtitle={I18n.t(expired ? 'auth.expired_password.description' : 'auth.set_password.description')}
        alerts={alerts}
      >
        <form
          id="form-password"
          action={action}
          method="post"
          onSubmit={handleSubmit}
          ref={formRef}
        >
          <input type="hidden" name="_method" value={expired ? 'put' : 'patch'} />
          <input type="hidden" name="authenticity_token" value={csrfToken} />
          {recaptchaEnabled && <input type="hidden" name="recaptcha_token" value={recaptchaToken} />}
          {expired ? null : (
            <input
              type="hidden"
              name={invitation ? 'user[invitation_token]' : 'user[reset_password_token]'}
              value={token}
            />
          )}
          <Form component={false} layout="vertical">
            {expired ? (
              <AuthField
                id="current-password"
                name="user[current_password]"
                label={I18n.t('auth.current_password')}
                placeholder={I18n.t('auth.current_password_placeholder')}
                autoComplete="current-password"
                error={errors.current_password}
                secure
              />
            ) : null}
            <AuthField
              id="new-password"
              name="user[password]"
              label={I18n.t(expired ? 'auth.new_password' : 'auth.password')}
              placeholder={I18n.t(expired ? 'auth.new_password_placeholder' : 'auth.password_placeholder')}
              autoComplete="new-password"
              error={errors.password}
              secure
            />
            <AuthField
              id="confirm-password"
              name="user[password_confirmation]"
              label={I18n.t('auth.password_confirmation')}
              placeholder={I18n.t('auth.password_confirmation_placeholder')}
              autoComplete="new-password"
              error={errors.password_confirmation}
              secure
            />
            <Button color="primary" variant="solid" size="large" htmlType="submit" loading={submitting} block>
              {I18n.t(expired ? 'auth.expired_password.submit' : 'auth.set_password.submit')}
            </Button>
            {expired ? (
              <Flex justify="center" style={{ marginBlockStart: 16 }}>
                <Button color="primary" variant="link" href="/administration/sign_out">
                  {I18n.t('auth.logout')}
                </Button>
              </Flex>
            ) : null}
          </Form>
        </form>
      </AuthTemplate>
      {recaptchaEnabled && <div id="recaptcha-button" style={{ display: 'none' }} />}
    </>
  )
}

const connector = connect((state: RootState) => state, {})

export const SetPasswordPage = connector(SetPasswordPageComponent)

export default SetPasswordPage
