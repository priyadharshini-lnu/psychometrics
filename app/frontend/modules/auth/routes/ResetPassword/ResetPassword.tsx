import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Typography, Input, Alert, Form,
} from 'antd'
import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import styles from '../Registration/styles.less'
import { RootState } from '../../core/reducers'
import { InputField } from '../../components/InputField'
import { Flash } from '~/components/Flash'
import { useRecaptcha } from '~/hooks/useRecaptcha'

const { I18n, PsyGlobalState } = window

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const ResetPasswordComponent: React.FC<Props> = ({
  projectConfig, csrfToken, user, errors,
}) => {
  const [form] = Form.useForm()

  useRecaptcha({
    formInstance: form,
    disable_recaptcha: !PsyGlobalState.recaptchaSiteKey,
  })

  const handleSubmit = () => {
    (document.getElementById('form-reset') as HTMLFormElement).submit()
  }

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
      <Flash />
      <Form
        form={form}
        id="form-reset"
        layout="vertical"
        action={projectConfig.id ? '/users/password' : '/administration/passwords'}
        method="post"
        onFinish={handleSubmit}
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
          id="recaptcha-button"
        />
        <Input type="hidden" name="recaptcha_token" />
        <div>
          {' '}
          <Link to="/users/sign_in">
            {I18n.t('auth.reset_password.back_to_sign_in')}
          </Link>
        </div>
      </Form>
    </div>
  )
}

const connector = connect((state: RootState) => (state), {})

export const ResetPassword = connector(ResetPasswordComponent)
