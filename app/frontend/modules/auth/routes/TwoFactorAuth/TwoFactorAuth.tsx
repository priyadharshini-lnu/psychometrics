import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Typography, Input, Button as ButtonAnt, Form,
} from 'antd'
import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import styles from './styles.less'
import { RootState } from '../../core/reducers'
import { InputField } from '../../components/InputField'
import { Flash } from '~/components/Flash'

const { I18n } = window

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const TwoFactorAuthComponent: React.FC<Props> = ({
  csrfToken, user, errors, projectConfig,
}) => (
  <div className={styles.container}>
    <Typography.Title level={3}>{I18n.t('auth.otp.title')}</Typography.Title>
    <Typography.Paragraph className={styles.description}>
      {I18n.t('auth.otp.description')}
    </Typography.Paragraph>
    <Flash />
    <Form
      id="form-login"
      layout="vertical"
      action="/users/two_factor_authentication"
      method="post"
      onFinish={() => (document.getElementById('form-login') as HTMLFormElement).submit()}
    >
      <Input type="hidden" name="_method" value="put" />
      <Input type="hidden" name="authenticity_token" value={csrfToken} />
      <Input type="hidden" name="user[reset_password_token]" value={user.reset_password_token} />
      <InputField
        label={I18n.t('auth.email')}
        name="user[email]"
        placeholder={I18n.t('auth.email_placeholder')}
        defaultValue={user.email}
        disabled
      />
      <InputField
        label={I18n.t('auth.otp.code')}
        name="code"
        placeholder={I18n.t('auth.otp.code_placeholder')}
        errors={errors.otp}
        inputMode="numeric"
        pattern="[0-9]*"
      />
      <ButtonAnt href="/users/two_factor_authentication/resend_code" type="link" className={styles.resendBtn} block>
        {I18n.t('auth.otp.resend')}
      </ButtonAnt>
      <ButtonWithArrow
        label={I18n.t('auth.otp.submit')}
        type="primary"
        size="large"
        htmlType="submit"
        className={styles.submit}
        block
      />
      <ButtonAnt
        href={projectConfig.id ? '/users/sign_out' : '/administration/sign_out'}
        type="link"
        className={styles.signoutBtn}
        block
      >
        {I18n.t('auth.sign_out')}
      </ButtonAnt>
    </Form>
  </div>
)

const connector = connect((state: RootState) => (state), {})

export const TwoFactorAuth = connector(TwoFactorAuthComponent)
