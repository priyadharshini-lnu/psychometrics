import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Typography, Input, Button as ButtonAnt, Form,
} from 'antd'
import { ButtonWithArrow } from 'glint/components/ButtonWithArrow'
import styles from './styles.less'
import { RootState } from '../../core/reducers'
import { InputField } from '../../components/InputField'
import { Flash } from '../../components/Flash'

const { I18n } = window

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const TwoFactorAuthComponent: React.FC<Props> = ({
  csrfToken, user, errors, flash,
}) => (
  <div className={styles.container}>
    <Typography.Title level={3}>{I18n.t('auth.otp.title')}</Typography.Title>
    <Typography.Paragraph className={styles.description}>
      {I18n.t('auth.otp.description')}
    </Typography.Paragraph>
    <Flash flash={flash} />
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
        label={I18n.t('auth.otp.code')}
        name="code"
        placeholder={I18n.t('auth.otp.code_placeholder')}
        errors={errors.otp}
      />
      <ButtonWithArrow
        label={I18n.t('auth.otp.submit')}
        type="primary"
        size="large"
        htmlType="submit"
        className={styles.submit}
        block
      />
      <ButtonAnt href="/users/two_factor_authentication/resend_code" type="link" className={styles.resend} block>
        {I18n.t('auth.otp.resend')}
      </ButtonAnt>
      <div>
        <a href="/users/sign_out">
          {I18n.t('auth.sign_out')}
        </a>
      </div>
    </Form>
  </div>
)

const connector = connect((state: RootState) => (state), {})

export const TwoFactorAuth = connector(TwoFactorAuthComponent)
