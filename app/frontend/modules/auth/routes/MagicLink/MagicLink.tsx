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

const MagicLinkComponent: React.FC<Props> = ({
  projectConfig, csrfToken, user, errors, clearFlashMessage,
}) => (
  <div className={styles.container}>
    <Typography.Title level={3}>{I18n.t('auth.login.title')}</Typography.Title>
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
        {!projectConfig.disallow_password_login
          && (
          <div>
            <Link to="/users/sign_in" onClick={() => { clearFlashMessage() }}>
              {I18n.t('auth.magic_link.login_with_password')}
            </Link>
          </div>
          )
        }
      </Form>
    </>
  </div>
)

const connector = connect((state: RootState) => (state), { clearFlashMessage })

export const MagicLink = connector(MagicLinkComponent)
