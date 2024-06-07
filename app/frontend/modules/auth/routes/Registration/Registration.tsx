/* eslint-disable react/no-danger */

import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Typography, Input, Alert, Row, Col, Form, Button,
} from 'antd'
import { CheckCircleOutlined, EditOutlined } from '@ant-design/icons'

import { PhoneNumber } from 'antd-phone-input/types'
import { ButtonWithArrow } from '~/glint/components/ButtonWithArrow'
import styles from './styles.less'
import { RootState } from '../../core/reducers'
import { InputField } from '../../components/InputField'
import { PhoneNumberField } from '../../../../glint/components/PhoneNumberField'
import { OtpVerificationModal } from './OtpVerificationModal'
import {
  sendMobileNumberVerificationOtp,
} from '../../core/otpVerification'

const { I18n } = window

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

interface ValidationObject {
  valid: (arg: boolean) => boolean
}

const RegistrationComponent: React.FC<Props> = ({
  projectConfig,
  csrfToken,
  user,
  errors,
  sendMobileNumberVerificationOtp,
}) => {
  const [isPhoneNumberValid, setPhoneNumberValid] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState(user.mobile_number)
  const [otpVerificationModalVisible, setOtpVerificationModalVisible] = useState(false)
  const [verificationToken, setVerificationToken] = useState(
    user.mobile_verification_token,
  )
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handlePhoneNumberChange = (value: PhoneNumber) => {
    const fullPhoneNumber = `+${value.countryCode}${value.areaCode}${value.phoneNumber}`

    setPhoneNumber(fullPhoneNumber)
  }

  const validator = (_: unknown, { valid }: ValidationObject) => {
    if (verificationToken || valid(true)) {
      setPhoneNumberValid(true)
      return Promise.resolve()
    }

    setPhoneNumberValid(false)
    return Promise.reject()
  }

  const handleOpenOtpVerificationModal = () => {
    setLoading(true)
    sendMobileNumberVerificationOtp({
      mobileNumber: phoneNumber,
      smsInviteCode: user.sms_invite_code,
      registrationCode: user.registration_code,
      projectId: projectConfig.id,
    }).then(() => {
      setLoading(false)
      setOtpVerificationModalVisible(true)
    }).catch(setError).then(() => setLoading(false))
  }

  const handleCloseOtpVerificationModal = () => {
    setOtpVerificationModalVisible(false)
  }

  const handleMobileNumberEdit = () => {
    setVerificationToken('')
  }

  const handleOnVerificationSuccess = (
    verificationToken: React.SetStateAction<string>,
  ) => {
    setVerificationToken(verificationToken)
    setOtpVerificationModalVisible(false)
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
        initialValues={{
          mobile_number: user.mobile_number,
          'user[mobile_number]': user.mobile_number,
          'user[mobile_verification_token]': user.mobile_verification_token,
        }}
        onFinish={() => (
            document.getElementById('form-registration') as HTMLFormElement
        ).submit()
        }
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
          <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <PhoneNumberField
                label={I18n.t('auth.mobile_number')}
                name="mobile_number"
                validator={validator}
                errors={errors.mobile_number}
                handlePhoneNumberChange={handlePhoneNumberChange}
                disabled={!!verificationToken}
              />

              { verificationToken && (
                <>
                  <Button type="link" disabled style={{ padding: 5, marginTop: '30px' }}>
                    <CheckCircleOutlined />
                  </Button>
                  <Button
                    type="link"
                    onClick={handleMobileNumberEdit}
                    style={{ padding: 5, marginTop: '30px' }}
                  >
                    <EditOutlined />
                    {I18n.t('common.actions.edit')}
                  </Button>
                </>
              ) }

              {(isPhoneNumberValid && !verificationToken) && (
                <Button
                  type="link"
                  loading={loading}
                  onClick={handleOpenOtpVerificationModal}
                  style={{ marginTop: '30px' }}
                >
                  {I18n.t('common.actions.verify')}
                </Button>
              )}
            </div>
            <Input
              type="hidden"
              name="user[mobile_number]"
              value={phoneNumber}
            />
            <Input
              type="hidden"
              name="user[mobile_verification_token]"
              value={verificationToken}
            />
          </>
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
                terms_url: 'https://thetalententerprise.com/privacy-statement/',
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

      <OtpVerificationModal
        mobileNumber={phoneNumber}
        visible={otpVerificationModalVisible}
        onCancel={handleCloseOtpVerificationModal}
        onVerificationSuccess={handleOnVerificationSuccess}
        registrationCode={user.registration_code}
        smsInviteCode={user.sms_invite_code}
      />
    </div>
  )
}


const connector = connect((state: RootState) => state, { sendMobileNumberVerificationOtp })

export const Registration = connector(RegistrationComponent)
