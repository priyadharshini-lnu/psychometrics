/* eslint-disable react/no-danger */

import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Input, Button,
} from 'antd'
import { PhoneNumberUtil } from 'google-libphonenumber'
import { CheckCircleOutlined, EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import styles from './styles.less'
import { RootState } from '../../core/reducers'
import { PhoneNumberField } from '../../../../glint/components/PhoneNumberField'
import { OtpVerificationForm } from './OtpVerificationForm'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import {
  AsyncExternalAssessmentTR,
  AsyncExternalAssessment,
} from '~/modules/admin/modules/client/core/externalAssessments'

const { I18n } = window
const RESEND_OTP_DELAY = 120
const TOKEN_EXPIRATION_TIME = 8 * 60 * 1000 // 8 minutes

interface MobileNumberRegistrationFormProps {
  verificationToken: string | undefined
  setError: (error: (string)) => void
  setVerificationToken: (verificationToken: string) => void
}

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux& MobileNumberRegistrationFormProps

const phoneUtil = PhoneNumberUtil.getInstance()

const isPhoneValid = (phone: string) => {
  try {
    return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone))
  } catch (error) {
    return false
  }
}

const MobileNumberRegistrationForm: React.FC<Props> = ({
  projectConfig,
  user,
  errors,
  setError,
  verificationToken,
  setVerificationToken,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(user.mobile_number || '')
  const [otpVerificationFormVisible, setOtpVerificationFormVisible] = useState(false)

  const isPhoneNumberValid = isPhoneValid(phoneNumber)

  const {
    makeAsyncRequest: resentOtp, asyncLoading: resentOtpLoading,
  } = useAsyncRequestResponse<AsyncExternalAssessment>({
    url: '/mobile_number_verifications/send_verification_code',
    data: {
      mobileNumber: phoneNumber,
      smsInviteCode: user.sms_invite_code,
      registrationCode: user.registration_code,
      projectId: projectConfig.id,
    },
    responseType: AsyncExternalAssessmentTR,
    onFailure: (response) => {
      let errorMessage: string

      if (Array.isArray(response)) {
        setOtpVerificationFormVisible(false)
        errorMessage = response.join(', ')
      } else {
        errorMessage = response.responseData
      }

      setError(errorMessage || I18n.t('common.errors.something_wrong'))
    },
  })

  const handleOpenOtpVerificationModal = () => {
    const verificationToken = getValidVerificationToken()

    if (verificationToken) {
      setVerificationToken(verificationToken)
      return
    }

    const nextOtpTime = localStorage.getItem(`nextOtpTime_${phoneNumber}`)
    let newRemainingTime = 0

    if (nextOtpTime) {
      newRemainingTime = parseInt(nextOtpTime, 10) - Date.now()
    }

    if (newRemainingTime > 0) {
      setOtpVerificationFormVisible(true)
    } else {
      resentOtp().then(() => {
        const nextOtpTime = Date.now() + RESEND_OTP_DELAY * 1000
        localStorage.setItem(`nextOtpTime_${phoneNumber}`, nextOtpTime.toString())

        setOtpVerificationFormVisible(true)
      }).catch(setError).catch(setError)
    }
  }

  const getValidVerificationToken = (): string | null => {
    const storedToken = localStorage.getItem(`verificationToken_${phoneNumber}`)
    const storedTimestamp = localStorage.getItem(`tokenTimestamp_${phoneNumber}`)
    const verificationToken = storedToken || user.mobile_verification_token

    if (verificationToken && storedTimestamp) {
      const remainingTime = Date.now() - parseInt(storedTimestamp, 10)

      if (remainingTime < TOKEN_EXPIRATION_TIME) {
        return verificationToken
      }
    }
    return null
  }

  const handleCloseOtpVerificationForm = () => {
    setOtpVerificationFormVisible(false)
  }

  const handleMobileNumberEdit = () => {
    setVerificationToken('')
    setOtpVerificationFormVisible(false)
  }

  const handleOnVerificationSuccess = (
    verificationToken: string,
  ) => {
    localStorage.setItem(`verificationToken_${phoneNumber}`, verificationToken)
    localStorage.setItem(`tokenTimestamp_${phoneNumber}`, Date.now().toString())

    setVerificationToken(verificationToken)
    setOtpVerificationFormVisible(false)
  }

  useEffect(() => {
    const verificationToken = getValidVerificationToken()
    if (verificationToken) {
      setVerificationToken(verificationToken)
      localStorage.setItem(`verificationToken_${phoneNumber}`, verificationToken)
    }
  }, [phoneNumber, setVerificationToken])

  return (
    <>
      <div className={styles.mobileNumberSection}>
        <PhoneNumberField
          label={I18n.t('auth.mobile_number')}
          name="mobile_number"
          errors={errors.mobile_number}
          disabled={!!verificationToken || otpVerificationFormVisible}
          value={phoneNumber}
          onChange={phone => setPhoneNumber(phone)}
        />
        <>
          { (verificationToken) && (
            <Button type="link" style={{ padding: 5, marginTop: '30px' }}>
              <CheckCircleOutlined style={{ color: 'green' }} />
            </Button>
          ) }

          { (verificationToken || otpVerificationFormVisible) && (
            <Button
              type="link"
              onClick={handleMobileNumberEdit}
              style={{ padding: 5, marginTop: '30px' }}
            >
              <EditOutlined />
              {I18n.t('common.actions.edit')}
            </Button>
          ) }
        </>

        {(!verificationToken && !otpVerificationFormVisible) && (
          <Button
            disabled={!isPhoneNumberValid}
            type="link"
            loading={resentOtpLoading}
            onClick={handleOpenOtpVerificationModal}
            style={{ marginTop: '30px' }}
          >
            {I18n.t('common.actions.verify')}
          </Button>
        )}
      </div>

      {otpVerificationFormVisible && (
        <OtpVerificationForm
          mobileNumber={phoneNumber}
          onCancel={handleCloseOtpVerificationForm}
          onVerificationSuccess={handleOnVerificationSuccess}
          registrationCode={user.registration_code}
          smsInviteCode={user.sms_invite_code}
          RESEND_OTP_DELAY={RESEND_OTP_DELAY}
        />
      )}
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
  )
}

const connector = connect(
  (state: RootState) => ({
    projectConfig: state.projectConfig,
    user: state.user,
    errors: state.errors,
  }),
  {},
)

export const MobileNumberRegistrationComponent = connector(MobileNumberRegistrationForm)
