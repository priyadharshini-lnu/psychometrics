import React, { useRef } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Typography, Input,
} from 'antd'
import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import styles from '../Registration/styles.less'
import { RootState } from '../../core/reducers'
import { InputField } from '../../components/InputField'
import { useRecaptcha } from '~/hooks/useRecaptcha'

const { I18n } = window
const { disable_recaptcha } = window.PsyGlobalState.features

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const SetPasswordComponent: React.FC<Props> = ({
  projectConfig, csrfToken, user, errors,
}) => {
  const adminSide = projectConfig.id === undefined

  if (!user.reset_password_token) { return null }
  const recaptchaEnabled = !disable_recaptcha && (adminSide || projectConfig.enable_recaptcha)

  const handleSubmit = (e) => {
    if (!recaptchaEnabled) { return }
    if (!recaptchaReady || recaptchaWidgetId.current === null) {
      return
    }
    if (!recaptchaToken) {
      e.preventDefault()
      window.grecaptcha.execute(recaptchaWidgetId.current)
    }
  }

  const formRef = useRef<HTMLFormElement>(null)

  const {
    recaptchaToken,
    recaptchaReady,
    recaptchaWidgetId,
  } = useRecaptcha({ formRef, disable_recaptcha: !recaptchaEnabled })

  return (
    <div className={styles.container}>
      <Typography.Title level={3}>{I18n.t('auth.set_password.title')}</Typography.Title>
      <Typography.Paragraph className={styles.description}>
        {I18n.t('auth.set_password.description')}
      </Typography.Paragraph>
      <form
        id="form-password"
        ref={formRef}
        action={adminSide ? '/administration/passwords' : '/users/password'}
        method="post"
        onSubmit={handleSubmit}
      >
        <Input type="hidden" name="_method" value="patch" />
        <Input type="hidden" name="authenticity_token" value={csrfToken} />
        {recaptchaEnabled && (
          <Input type="hidden" name="recaptcha_token" value={recaptchaToken} />
        )}
        <Input type="hidden" name="user[reset_password_token]" value={user.reset_password_token} />
        <InputField
          label={I18n.t('auth.password')}
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
          label={I18n.t('auth.set_password.submit')}
          type="primary"
          size="large"
          htmlType="submit"
          className={styles.submit}
          block
        />
      </form>
      {/* Hidden div for reCAPTCHA widget */}
      {recaptchaEnabled && <div id="recaptcha-button" style={{ display: 'none' }} />}
    </div>
  )
}

const connector = connect((state: RootState) => (state), {})

export const SetPassword = connector(SetPasswordComponent)
