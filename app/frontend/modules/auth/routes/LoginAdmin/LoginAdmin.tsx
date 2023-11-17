import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Typography, Input } from 'antd'
import { Link } from 'react-router-dom'
import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import styles from './styles.less'
import { RootState } from '../../core/reducers'
import { InputField } from '../../components/InputField'
import { Flash } from '~/components/Flash'

const { I18n } = window

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const LoginComponent: React.FC<Props> = ({
  csrfToken, flash, user,
}) => (
  <div className={styles.container}>
    <Typography.Title level={3}>{I18n.t('auth.login.title')}</Typography.Title>
    <Typography.Paragraph className={styles.description}>
      {I18n.t('auth.login.description')}
    </Typography.Paragraph>
    <>
      <Flash flash={flash} />
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
  </div>
)

const connector = connect((state: RootState) => (state), {})

export const LoginAdmin = connector(LoginComponent)
