/* eslint-disable react/no-danger */

import React, { useState, useRef } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Typography, Input, Alert, Row, Col,
} from 'antd'

import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import styles from './styles.less'
import { RootState } from '../../core/reducers'
import { InputField } from '../../components/InputField'
import { MobileNumberRegistrationComponent } from './MobileNumberRegistrationComponent'
import { useRecaptcha } from '~/hooks/useRecaptcha'

const { I18n } = window
const { disable_recaptcha } = window.PsyGlobalState.features

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux


const RegistrationComponent: React.FC<Props> = ({
  projectConfig,
  csrfToken,
  user,
  errors,
}) => {
  const [verificationToken, setVerificationToken] = useState(
    user.mobile_verification_token,
  )
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e) => {
    try {
      clearVerificationTokens()

      if (!disable_recaptcha) {
        if (!recaptchaReady || recaptchaWidgetId.current === null) {
          // e.preventDefault()
          return
        }
        if (!recaptchaToken) {
          e.preventDefault()
          window.grecaptcha.execute(recaptchaWidgetId.current)
        }
      }
    } catch (e) { /* empty */ }
  }

  const clearVerificationTokens = () => {
    const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith('verificationToken_'))
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  const formRef = useRef<HTMLFormElement>(null)

  const {
    recaptchaToken,
    recaptchaReady,
    recaptchaWidgetId,
  } = useRecaptcha({ formRef, disable_recaptcha })


  return (
    <div className={styles.container}>
      <Typography.Title level={3}>
        {I18n.t('auth.registration.title')}
      </Typography.Title>
      <Typography.Paragraph className={styles.description}>
        {I18n.t('auth.registration.description')}
      </Typography.Paragraph>

      {errors.base?.length > 0 && (
        <div className={styles.alerts}>
          {errors.base.map(message => (
            <Alert message={message} type="error" />
          ))}
        </div>
      )}

      {error && <Alert message={error} type="error" />}

      <form
        id="form-registration"
        ref={formRef}
        action="/users"
        method="post"
        onSubmit={handleSubmit}
      >
        <Input type="hidden" name="authenticity_token" value={csrfToken} />
        {!disable_recaptcha && (
          <Input type="hidden" name="recaptcha_token" value={recaptchaToken} />
        )}
        <Row gutter={16}>
          <Col span={12}>
            <InputField
              label={I18n.t('auth.registration.first_name')}
              name="user[first_name]"
              placeholder={I18n.t('auth.registration.first_name_placeholder')}
              errors={errors.first_name}
              defaultValue={user.first_name}
            />
          </Col>
          <Col span={12}>
            <InputField
              label={I18n.t('auth.registration.last_name')}
              name="user[last_name]"
              placeholder={I18n.t('auth.registration.last_name_placeholder')}
              errors={errors.last_name}
              defaultValue={user.last_name}
            />
          </Col>
        </Row>
        <InputField
          label={I18n.t('auth.email')}
          name="user[email]"
          placeholder={I18n.t('auth.email_placeholder')}
          errors={errors.email}
          defaultValue={user.email}
        />


        {projectConfig.require_mobile_number && (
          <MobileNumberRegistrationComponent
            setError={setError}
            verificationToken={verificationToken}
            setVerificationToken={setVerificationToken}
          />
        )}

        <Typography.Paragraph className={styles.hint}>
          {I18n.t('auth.registration.email_hint')}
        </Typography.Paragraph>
        {user.sms_invite_code ? (
          <Input
            type="hidden"
            name="user[sms_invite_code]"
            value={user.sms_invite_code}
          />
        ) : (
          <InputField
            hidden={!!user.registration_code && !errors.registration_code}
            label={I18n.t('auth.registration.registration_code')}
            name="user[registration_code]"
            placeholder={I18n.t(
              'auth.registration.registration_code_placeholder',
            )}
            errors={errors.registration_code}
            defaultValue={user.registration_code}
          />
        )}
        <Typography.Paragraph className={styles.hint}>
          <div
            dangerouslySetInnerHTML={{
              __html: I18n.t('auth.registration.terms_notice', {
                terms_url: `/privacy-statement?lang=${I18n.currentLocale()}`,
              }),
            }}
          />
        </Typography.Paragraph>
        <ButtonWithArrow
          label={I18n.t('auth.sign_up')}
          type="primary"
          size="large"
          htmlType="submit"
          className={styles.submit}
          disabled={
            projectConfig.require_mobile_number ? !verificationToken : false
          }
          block
        />
        <div>
          {I18n.t('auth.registration.have_account')}
          {' '}
          <Link to="/users/sign_in">
            {I18n.t('auth.registration.login_now')}
          </Link>
        </div>
      </form>
      {/* Hidden div for reCAPTCHA widget */}
      {!disable_recaptcha && <div id="recaptcha-button" style={{ display: 'none' }} />}
    </div>
  )
}

const connector = connect(
  (state: RootState) => ({
    ...state,
  }),
  { },
)

export const Registration = connector(RegistrationComponent)
