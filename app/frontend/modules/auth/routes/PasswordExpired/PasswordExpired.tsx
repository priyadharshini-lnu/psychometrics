import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Typography, Input, Form, Button,
} from 'antd'
import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import styles from './styles.less'
import { RootState } from '../../core/reducers'
import { InputField } from '../../components/InputField'
import { Flash } from '../../components/Flash'

const { I18n } = window

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const PasswordExpiredComponent: React.FC<Props> = ({
  projectConfig, csrfToken, errors, flash,
}) => (
  <div className={styles.container}>
    <Typography.Title level={3}>{I18n.t('auth.expired_password.title')}</Typography.Title>
    <Typography.Paragraph className={styles.description}>
      {I18n.t('auth.expired_password.description')}
    </Typography.Paragraph>
    <Flash flash={flash} />
    <Form
      id="form-login"
      layout="vertical"
      action={projectConfig.id ? '/users/password_expired' : '/administration/password_expired'}
      method="post"
      onFinish={() => (document.getElementById('form-login') as HTMLFormElement).submit()}
    >
      <Input type="hidden" name="_method" value="put" />
      <Input type="hidden" name="authenticity_token" value={csrfToken} />
      <InputField
        label={I18n.t('auth.current_password')}
        name="user[current_password]"
        placeholder={I18n.t('auth.current_password_placeholder')}
        errors={errors.current_password}
        password
      />
      <InputField
        label={I18n.t('auth.new_password')}
        name="user[password]"
        placeholder={I18n.t('auth.password_placeholder')}
        errors={errors.password}
        password
      />
      <InputField
        label={I18n.t('auth.password_confirmation')}
        name="user[password_confirmation]"
        placeholder={I18n.t('auth.password_confirmation_placeholder')}
        errors={errors.password_confirmation}
        password
      />
      <ButtonWithArrow
        label={I18n.t('auth.expired_password.submit')}
        type="primary"
        size="large"
        htmlType="submit"
        className={styles.submit}
        block
      />
      <Button
        href={projectConfig.id ? '/users/sign_out' : '/administration/sign_out'}
        type="link"
        className={styles.logoutBtn}
        block
      >
        {I18n.t('auth.logout')}
      </Button>
    </Form>
  </div>
)

const connector = connect((state: RootState) => (state), {})

export const PasswordExpired = connector(PasswordExpiredComponent)
