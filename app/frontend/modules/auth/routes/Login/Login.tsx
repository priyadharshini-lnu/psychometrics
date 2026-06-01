import React, { useRef } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Typography, Input,
} from 'antd'
import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import styles from './styles.less'
import { RootState } from '../../core/reducers'
import { InputField } from '../../components/InputField'
import { Flash } from '~/components/Flash'
import { MagicLink } from '../MagicLink'
import { useRecaptcha } from '~/hooks/useRecaptcha'


const { I18n } = window
const { disable_recaptcha } = window.PsyGlobalState.features

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const isSowDivider = (projectConfig) => {
  if (projectConfig.disallow_password_login) { return false }
  return (projectConfig.magic_link_enabled || (projectConfig.saml_login_allowed && !projectConfig.saml_enforced))
}

const LoginComponent: React.FC<Props> = ({
  projectConfig, csrfToken, user,
}) => {
  if (projectConfig.disallow_password_login) {
    return <MagicLink />
  }

  const recaptchaEnabled = !disable_recaptcha && projectConfig.enable_recaptcha
  const formRef = useRef<HTMLFormElement>(null)

  const {
    recaptchaToken,
    recaptchaReady,
    recaptchaWidgetId,
  } = useRecaptcha({ formRef, disable_recaptcha: !recaptchaEnabled })


  const handleSubmit = (e) => {
    if (!recaptchaEnabled) { return }
    if (!recaptchaReady || recaptchaWidgetId.current === null) {
      e.preventDefault()
      return
    }
    if (!recaptchaToken) {
      e.preventDefault()
      window.grecaptcha.execute(recaptchaWidgetId.current)
    }
  }

  return (
    <div className={styles.container}>
      <Typography.Title level={1}>{I18n.t('auth.login.title')}</Typography.Title>
      <Typography.Paragraph className={styles.description}>
        {I18n.t('auth.login.description')}
      </Typography.Paragraph>

      {projectConfig.saml_login_allowed && (
        <>
          {projectConfig.saml_enforced && (
            <div style={{ marginBottom: 16 }}>
              <Flash />
            </div>
          )}
          <ButtonWithArrow
            href="/users/saml/sign_in"
            size="large"
            type={projectConfig.saml_enforced ? 'primary' : 'default'}
            label={I18n.t('auth.login.sso_btn')}
            style={{ marginBottom: 16 }}
            block
          />
        </>
      )}

      {projectConfig.magic_link_enabled && (
        <Link to="/users/magic_links/sign_in">
          <ButtonWithArrow
            size="large"
            type="default"
            label={I18n.t('auth.login.magic_link_btn')}
            block
          />
        </Link>
      )}

      {isSowDivider(projectConfig) ? (
        <div className={styles.divider}>
          <hr />
          <div className={styles.label}><span>{I18n.t('auth.login.or')}</span></div>
        </div>
      ) : null}

      {!projectConfig.saml_enforced && !projectConfig.disallow_password_login && (
        <>
          <Flash />
          <form
            id="form-login"
            ref={formRef}
            className={styles.form}
            // layout="vertical"
            action="/users/sign_in"
            method="post"
            onSubmit={handleSubmit}
          >
            <Input type="hidden" name="authenticity_token" value={csrfToken} />
            {recaptchaEnabled && (
              <Input type="hidden" name="recaptcha_token" value={recaptchaToken} />
            )}
            <InputField
              label={I18n.t('auth.email')}
              name="user[email]"
              placeholder={I18n.t('auth.email_placeholder')}
              defaultValue={user.email}
              autoComplete="tte-user-email"
              labelFor="email"
              id="email"
            />
            <InputField
              label={I18n.t('auth.password')}
              name="user[password]"
              placeholder={I18n.t('auth.password_placeholder')}
              password
              labelFor="password"
              id="password"
              autoComplete="tte-user-password"
            />
            <Link to="/users/password/new">
              {I18n.t('auth.login.forgot_password')}
            </Link>
            <ButtonWithArrow
              label={I18n.t('auth.login.login_btn')}
              type="primary"
              size="large"
              htmlType="submit"
              className={styles.submit}
              block
            />
            {!projectConfig.hide_signup ? (
              <div>
                {I18n.t('auth.login.not_member')}
                {' '}
                <Link to="/users/sign_up">
                  {I18n.t('auth.sign_up')}
                </Link>
              </div>
            ) : null}
          </form>
          {/* Hidden div for reCAPTCHA widget */}
          {recaptchaEnabled && <div id="recaptcha-button" style={{ display: 'none' }} />}
        </>
      )}
    </div>
  )
}

const connector = connect((state: RootState) => (state), {})

export const Login = connector(LoginComponent)
