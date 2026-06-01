import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Typography } from 'antd'
import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import EmailForm from './EmailForm'
import LoginForm from './LoginForm'
import styles from './styles.less'
import { RootState } from '../../core/reducers'
import { Flash } from '~/components/Flash'

const { I18n } = window
const { disable_saml_for_admins } = window.PsyGlobalState.features

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const LoginComponent: React.FC<Props> = ({
  csrfToken, user,
}) => {
  const clientContext = window.PsyGlobalState?.clientContextData
  const ssoEnabled = clientContext?.sso_enabled
  const ssoEnforced = clientContext?.sso_enforced
  const showPasswordForm = clientContext || disable_saml_for_admins

  return (
    <div className={styles.container}>
      <Typography.Title level={3}>{I18n.t('auth.login.title')}</Typography.Title>
      <Typography.Paragraph className={styles.description}>
        {I18n.t('auth.login.description')}
      </Typography.Paragraph>

      {ssoEnabled && (
        <>
          {ssoEnforced && (
            <div style={{ marginBottom: 16 }}>
              <Flash />
            </div>
          )}
          <ButtonWithArrow
            href="/users/saml/sign_in"
            size="large"
            type={ssoEnforced ? 'primary' : 'default'}
            label={I18n.t('auth.login.sso_btn')}
            style={{ marginBottom: 16 }}
            block
          />
        </>
      )}

      {ssoEnabled && !ssoEnforced && (
        <div className={styles.divider}>
          <hr />
          <div className={styles.label}><span>{I18n.t('auth.login.or')}</span></div>
        </div>
      )}

      {!ssoEnforced && (
        showPasswordForm
          ? <LoginForm csrfToken={csrfToken} user={user} />
          : <EmailForm csrfToken={csrfToken} user={user} />
      )}
    </div>
  )
}

const connector = connect(
  (state: RootState) => ({
    ...state,
  }),
  { },
)

export const LoginAdmin = connector(LoginComponent)
