/* eslint-disable react/no-danger */

import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Typography, Input, Alert, Row, Col, Form,
} from 'antd'

import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import styles from './styles.less'
import { RootState } from '../../core/reducers'
import { InputField } from '../../components/InputField'
import { MobileNumberRegistrationComponent } from './MobileNumberRegistrationComponent'

const { I18n } = window

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

  const handleSubmit = () => {
    try {
      clearVerificationTokens()

      const formElement = document.getElementById('form-registration') as HTMLFormElement
      formElement.submit()
    } catch (e) { /* empty */ }
  }

  const clearVerificationTokens = () => {
    const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith('verificationToken_'))
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }


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

      <Form
        id="form-registration"
        layout="vertical"
        action="/users"
        method="post"
        onFinish={handleSubmit}
      >
        <Input type="hidden" name="authenticity_token" value={csrfToken} />
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
                terms_url: `/privacy-statement/${I18n.currentLocale()}`,
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
      </Form>
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
