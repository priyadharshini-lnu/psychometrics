import React, { useState } from 'react'
import { Input } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import styles from './styles.less'
import { InputField } from '../../components/InputField'
import { Flash } from '~/components/Flash'
import PasswordForm from './PasswordForm'

const { I18n } = window

interface EmailFormProps {
  csrfToken: string
  user: { email: string }
}

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & EmailFormProps

const EmailFormComponent: React.FC<Props> = ({
  csrfToken, user,
}) => {
  const [email, setEmail] = useState(user.email || '')
  const [showLoginForm] = useState(!!user.email)

  return (
    <div className={styles.container}>
      <>
        <Flash />
        {!showLoginForm ? (
          <form
            className={styles.form}
            action="/administration/authenticate_user"
            method="post"
          >
            <Input type="hidden" name="authenticity_token" value={csrfToken} />
            <InputField
              label={I18n.t('auth.email')}
              name="user[email]"
              placeholder={I18n.t('auth.email_placeholder')}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <ButtonWithArrow
              label={I18n.t('auth.login.continue_btn')}
              type="primary"
              size="large"
              htmlType="submit"
              className={styles.submit}
              block
            />
          </form>
        ) : (
          <PasswordForm csrfToken={csrfToken} user={{ email }} />
        )}
      </>
    </div>
  )
}

const connector = connect(() => ({ }), {})

export default connector(EmailFormComponent)
