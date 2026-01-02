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

const InvitationComponent: React.FC<Props> = ({
  projectConfig, csrfToken, user, errors,
}) => {
  if (!user.invitation_token) { return null }

  const formRef = useRef<HTMLFormElement>(null)

  const {
    recaptchaToken,
    recaptchaReady,
    recaptchaWidgetId,
  } = useRecaptcha({ formRef, disable_recaptcha })

  return (
    <div className={styles.container}>
      <Typography.Title level={3}>{I18n.t('auth.set_password.title')}</Typography.Title>
      <Typography.Paragraph className={styles.description}>
        {I18n.t('auth.set_password.description')}
      </Typography.Paragraph>
      <form
        ref={formRef}
        className="ant-form ant-form-vertical"
        action={projectConfig.id ? '/users/invitation' : '/administration/invitations'}
        method="post"
        onSubmit={(e) => {
          if (!disable_recaptcha) {
            if (!recaptchaReady || recaptchaWidgetId.current === null) {
              e.preventDefault()
              return
            }
            if (!recaptchaToken) {
              e.preventDefault()
              window.grecaptcha.execute(recaptchaWidgetId.current)
            }
          }
        }}
      >
        <Input type="hidden" name="_method" value="patch" />
        <Input type="hidden" name="authenticity_token" value={csrfToken} />
        <Input type="hidden" name="user[invitation_token]" value={user.invitation_token} />
        {!disable_recaptcha && (
          <Input type="hidden" name="recaptcha_token" value={recaptchaToken} />
        )}
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
      {!disable_recaptcha && <div id="recaptcha-button" style={{ display: 'none' }} />}
    </div>
  )
}

const connector = connect((state: RootState) => (state), {})

export const Invitation = connector(InvitationComponent)
