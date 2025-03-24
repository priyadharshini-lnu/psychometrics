import React from 'react'
import { Input } from 'antd'
import { Link } from 'react-router-dom'
import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import { InputField } from '../../components/InputField'
import { Flash } from '~/components/Flash'
import styles from './styles.less'

const { I18n } = window

interface LoginFormProps {
  csrfToken: string
  user: { email: string }
}

const LoginForm: React.FC<LoginFormProps> = ({ csrfToken, user }) => (
  <>
    <Flash />
    <form
      className={styles.form}
      action="/administration"
      method="post"
    >
      <Input type="hidden" name="authenticity_token" value={csrfToken} />
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
  </>
)

export default LoginForm
