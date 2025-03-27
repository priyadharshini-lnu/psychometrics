import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Typography } from 'antd'
import EmailForm from './EmailForm'
import LoginForm from './LoginForm'
import styles from './styles.less'
import { RootState } from '../../core/reducers'

const { I18n } = window
const { disable_saml_for_admins } = window.PsyGlobalState.features

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const LoginComponent: React.FC<Props> = ({
  csrfToken, user,
}) => (
  <div className={styles.container}>
    <Typography.Title level={3}>{I18n.t('auth.login.title')}</Typography.Title>
    <Typography.Paragraph className={styles.description}>
      {I18n.t('auth.login.description')}
    </Typography.Paragraph>
    {disable_saml_for_admins ? (
      <LoginForm csrfToken={csrfToken} user={user} />
    ) : (
      <EmailForm csrfToken={csrfToken} user={user} />
    )}
  </div>
)

const connector = connect(
  (state: RootState) => ({
    ...state,
  }),
  { },
)

export const LoginAdmin = connector(LoginComponent)
