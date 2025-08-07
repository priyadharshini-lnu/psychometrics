import React, { useRef } from 'react'
import { Input } from 'antd'
import { Link } from 'react-router-dom'
import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import { InputField } from '../../components/InputField'
import { Flash } from '~/components/Flash'
import styles from './styles.less'
import { useRecaptcha } from '~/hooks/useRecaptcha'


const { I18n } = window
const { disable_recaptcha } = window.PsyGlobalState.features

interface LoginFormProps {
  csrfToken: string
  user: { email: string }
}

const LoginForm: React.FC<LoginFormProps> = ({ csrfToken, user }) => {
  const formRef = useRef<HTMLFormElement>(null)

  const {
    recaptchaToken,
    recaptchaReady,
    recaptchaWidgetId,
  } = useRecaptcha(formRef, disable_recaptcha)

  return (
    <>
      <Flash />
      <form
        ref={formRef}
        className={styles.form}
        action="/administration"
        method="post"
        onSubmit={(e) => {
          if (!disable_recaptcha) {
            if (!recaptchaReady || recaptchaWidgetId.current === null) {
              e.preventDefault()
              return
            }
            if (!recaptchaToken) {
              e.preventDefault()
              // eslint-disable-next-line no-console
              console.log('Executing reCAPTCHA')
              window.grecaptcha.execute(recaptchaWidgetId.current)
            }
          }
        }}
      >
        <Input type="hidden" name="authenticity_token" value={csrfToken} />
        {!disable_recaptcha && (
          <Input type="hidden" name="recaptcha_token" value={recaptchaToken} />
        )}
        <InputField
          label={I18n.t('auth.email')}
          name="user[email]"
          placeholder={I18n.t('auth.email_placeholder')}
          defaultValue={user.email}
        />
        <InputField
          label={I18n.t('auth.password')}
          name="user[password]"
          placeholder={I18n.t('auth.password_placeholder')}
          password
        />
        <Link to="/administration/passwords/new">
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
      </form>
      {/* Hidden div for reCAPTCHA widget */}
      {!disable_recaptcha && <div id="recaptcha-button" style={{ display: 'none' }} />}
    </>
  )
}

export default LoginForm
