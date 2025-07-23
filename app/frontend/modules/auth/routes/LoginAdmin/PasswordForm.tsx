import React, { useEffect, useState } from 'react'
import { Input } from 'antd'
import { Link } from 'react-router-dom'
import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import styles from './styles.less'
import { InputField } from '../../components/InputField'
import { fetchRecaptchaToken } from '~/utils/recaptcha'

const { I18n } = window
const { disable_recaptcha } = window.PsyGlobalState.features
const { recaptchaSiteKey } = window.PsyGlobalState

interface LoginFormProps {
  csrfToken: string
  user: {
    email: string
  }
}

const PasswordForm: React.FC<LoginFormProps> = ({ csrfToken, user }) => {
  const [recaptchaToken, setRecaptchaToken] = useState<string>('')

  useEffect(() => {
    if (!disable_recaptcha) {
      fetchRecaptchaToken(recaptchaSiteKey, 'login').then((token) => {
        setRecaptchaToken(token)
      })
    }
  }, [])
  return (
    <form className={styles.form} action="/administration" method="post">
      <Input type="hidden" name="authenticity_token" value={csrfToken} />
      <Input type="hidden" autoComplete="off" name="user[email]" value={user.email} />
      {!disable_recaptcha && (
        <Input type="hidden" name="recaptcha_token" value={recaptchaToken} />
      )}
      <InputField
        label={I18n.t('auth.email')}
        placeholder={I18n.t('auth.email_placeholder')}
        value={user.email}
        autoComplete="off"
        disabled
      />
      <InputField
        label={I18n.t('auth.password')}
        name="user[password]"
        placeholder={I18n.t('auth.password_placeholder')}
        password
        autoComplete="new-password"
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
  )
}

export default PasswordForm
