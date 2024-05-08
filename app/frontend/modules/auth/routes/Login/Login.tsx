import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Typography, Input, Form,
} from 'antd'
import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import styles from './styles.less'
import { RootState } from '../../core/reducers'
import { InputField } from '../../components/InputField'
import { Flash } from '~/components/Flash'

const { I18n } = window

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const LoginComponent: React.FC<Props> = ({
  projectConfig, csrfToken, user,
}) => (
  <div className={styles.container}>
    <Typography.Title level={3}>{I18n.t('auth.login.title')}</Typography.Title>
    <Typography.Paragraph className={styles.description}>
      {I18n.t('auth.login.description')}
    </Typography.Paragraph>

    {projectConfig.saml_login_allowed && (
      <>
        <ButtonWithArrow
          href="/users/saml/sign_in"
          size="large"
          type={projectConfig.saml_enforced ? 'primary' : 'default'}
          label={I18n.t('auth.login.sso_btn')}
          block
        />
        {!projectConfig.saml_enforced && (
          <div className={styles.divider}>
            <hr />
            <div className={styles.label}><span>{I18n.t('auth.login.or')}</span></div>
          </div>
        )}
      </>
    )}
    {!projectConfig.saml_enforced && (
      <>
        <Flash />
        <Form
          id="form-login"
          layout="vertical"
          action="/users/sign_in"
          method="post"
          onFinish={() => (document.getElementById('form-login') as HTMLFormElement).submit()}
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
          <div>
            {I18n.t('auth.login.not_member')}
            {' '}
            <Link to="/users/sign_up">
              {I18n.t('auth.sign_up')}
            </Link>
          </div>
        </Form>
      </>
    )}
  </div>
)

const connector = connect((state: RootState) => (state), {})

export const Login = connector(LoginComponent)
