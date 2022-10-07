import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Typography, Input, Alert,
} from 'antd'
import { ButtonWithArrow } from 'glint/components/ButtonWithArrow'
import styles from '../Registration/styles.less'
import { RootState } from '../../core/reducers'
import { InputField } from '../../components/InputField'

const { I18n } = window

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const ResetPasswordComponent: React.FC<Props> = ({
  projectConfig, csrfToken, user, errors,
}) => {
  if (user.reset_password_token) { return null }
  return (
    <div className={styles.container}>
      <Typography.Title level={3}>{I18n.t('auth.reset_password.title')}</Typography.Title>
      <Typography.Paragraph className={styles.description}>
        {I18n.t('auth.reset_password.description')}
      </Typography.Paragraph>
      {errors.base?.length > 0 && (
        <div className={styles.alerts}>
          {errors.base.map(message => <Alert message={message} type="error" />)}
        </div>
      )}
      <form
        className="ant-form ant-form-vertical"
        action={projectConfig.id ? '/users/password' : '/administration/passwords'}
        method="post"
      >
        <Input type="hidden" name="authenticity_token" value={csrfToken} />
        <InputField
          label={I18n.t('auth.email')}
          name="user[email]"
          placeholder={I18n.t('auth.email_placeholder')}
          errors={errors.email}
          defaultValue={user.email}
        />
        <ButtonWithArrow
          label={I18n.t('auth.reset_password.submit')}
          type="primary"
          size="large"
          htmlType="submit"
          className={styles.submit}
          block
        />
        <div>
          {' '}
          <Link to="/users/sign_in">
            {I18n.t('auth.reset_password.back_to_sign_in')}
          </Link>
        </div>
      </form>
    </div>
  )
}

const connector = connect((state: RootState) => (state), {})

export const ResetPassword = connector(ResetPasswordComponent)
