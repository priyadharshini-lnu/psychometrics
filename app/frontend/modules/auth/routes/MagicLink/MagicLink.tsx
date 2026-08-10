import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Typography, Input, Form, Alert,
} from 'antd'
import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import styles from './styles.less'
import { RootState } from '../../core/reducers'
import { InputField } from '../../components/InputField'
import { Flash } from '~/components/Flash'
import { clearFlashMessage } from '../../core/flash'

const { I18n } = window

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const isShowOtherOptions = projectConfig => (
  !projectConfig.disallow_password_login || (projectConfig.saml_login_allowed)
)

const MagicLinkComponent: React.FC<Props> = ({
  projectConfig, csrfToken, user, errors, clearFlashMessage,
}) => (
  <div className={styles.container}>
    <Typography.Title level={2}>{I18n.t('auth.login.title')}</Typography.Title>

    {isShowOtherOptions(projectConfig) ? (
      <Typography.Paragraph className={styles.description}>
        {I18n.t('auth.login.description')}
      </Typography.Paragraph>
    ) : null}

    {projectConfig.saml_login_allowed && (
      <Link to="/users/saml/sign_in">
        <ButtonWithArrow
          onClick={() => { clearFlashMessage() }}
          size="large"
          type={projectConfig.saml_enforced ? 'primary' : 'default'}
          label={I18n.t('auth.login.sso_btn')}
          block
          style={{ marginBottom: 16 }}
        />
      </Link>
    )}

    {!projectConfig.disallow_password_login && (
      <Link to="/users/sign_in" className="mt-2">
        <ButtonWithArrow
          onClick={() => { clearFlashMessage() }}
          size="large"
          type="default"
          label={I18n.t('auth.magic_link.login_with_password')}
          block

        />
      </Link>
    )}

    {isShowOtherOptions(projectConfig) ? (
      <div className={styles.divider}>
        <hr />
        <div className={styles.label}><span>{I18n.t('auth.login.or')}</span></div>
      </div>
    ) : null}

    <Typography.Paragraph className={styles.description}>
      {I18n.t('auth.magic_link.description')}
    </Typography.Paragraph>

    {errors.email?.length > 0 && (
      <div className={styles.alerts}>
        {errors.email?.map(message => (
          <Alert message={message} type="error" />
        ))}
      </div>
    )}
    <>
      <Flash />
      <Form
        id="form-login"
        layout="vertical"
        action="/users/magic_links/sign_in"
        method="post"
        onFinish={() => (document.getElementById('form-login') as HTMLFormElement).submit()}
      >
        <Input type="hidden" name="authenticity_token" value={csrfToken} />
        <InputField
          label={I18n.t('auth.email')}
          name="user[email]"
          required
          placeholder={I18n.t('auth.email_placeholder')}
          defaultValue={user.email}
        />
        <ButtonWithArrow
          label={I18n.t('auth.magic_link.send_me_login_link')}
          type="primary"
          size="large"
          htmlType="submit"
          className={styles.submit}
          block
        />
      </Form>
    </>
  </div>
)

const connector = connect((state: RootState) => (state), { clearFlashMessage })

export const MagicLink = connector(MagicLinkComponent)
