import React, { useEffect, useRef, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Button, Alert, Input } from 'antd'
import styles from './styles.less'
import { RootState } from '../../core/reducers'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import {
  AsyncExternalAssessmentTR,
  AsyncExternalAssessment,
} from '~/modules/admin/modules/client/core/externalAssessments'

interface OtpVerificationProps {
  mobileNumber: string
  registrationCode: string | undefined
  smsInviteCode: string | undefined
  onCancel: () => void
  onVerificationSuccess: (verificationToken: string) => void
  RESEND_OTP_DELAY: number
}

const connector = connect(
  (state: RootState) => ({
    projectConfig: state.projectConfig,
  }),
  { },
)

const { I18n } = window
export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & OtpVerificationProps

const OtpVerificationComponent: React.FC<Props> = ({
  projectConfig,
  mobileNumber,
  registrationCode,
  smsInviteCode,
  onCancel,
  onVerificationSuccess,
  RESEND_OTP_DELAY,
}) => {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState(null)
  const [otpResetNotification, setOtpResetNotification] = useState(null)
  const [remainingTime, setRemainingTime] = useState<number>(() => getRemainingTime(mobileNumber))
  const [resendCount, setResendCount] = useState(0)

  const inputRef = useRef<typeof Input.prototype>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (mobileNumber) {
      const nextOtpTime = localStorage.getItem(`nextOtpTime_${mobileNumber}`)

      if (nextOtpTime) {
        let remainingTime = parseInt(nextOtpTime, 10) - Date.now()

        const countdown = setInterval(() => {
          const newRemainingTime = remainingTime - 1000

          if (newRemainingTime <= 0) {
            clearInterval(countdown)
            localStorage.removeItem(`nextOtpTime_${mobileNumber}`)
            setRemainingTime(0)
          } else {
            remainingTime = newRemainingTime
            setRemainingTime(remainingTime)
          }
        }, 1000)
      }
    }
  }, [mobileNumber, resendCount])

  const handleCancel = () => {
    setError(null)
    setOtp('')

    onCancel()
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value)
    setOtpResetNotification(null)
  }

  const {
    makeAsyncRequest: sendVerificationCode, asyncLoading: verificationCodeSending,
  } = useAsyncRequestResponse<AsyncExternalAssessment>({
    url: '/mobile_number_verifications/verify',
    data: { mobileNumber, verificationCode: otp },
    responseType: AsyncExternalAssessmentTR,
    onFailure: (response) => {
      const { errorMessage } = response.responseData

      setError(errorMessage || I18n.t('common.errors.something_wrong'))
    },
  })

  const {
    makeAsyncRequest: resentOtp, asyncLoading: resentOtpLoading,
  } = useAsyncRequestResponse<AsyncExternalAssessment>({
    url: '/mobile_number_verifications/send_verification_code',
    data: {
      mobileNumber,
      smsInviteCode,
      registrationCode,
      projectId: projectConfig.id,
    },
    responseType: AsyncExternalAssessmentTR,
    onFailure: (response) => {
      let errorMessage: string

      if (Array.isArray(response)) {
        errorMessage = response.join(', ')
      } else {
        errorMessage = response.responseData
      }

      setError(errorMessage || I18n.t('common.errors.something_wrong'))
    },
  })

  const handleSubmit = () => {
    sendVerificationCode().then((response) => {
      const { verificationToken } = response.responseData

      setError(null)

      onVerificationSuccess(verificationToken)
      localStorage.removeItem(`nextOtpTime_${mobileNumber}`)
    }).catch(setError)
  }

  const handleResendOtp = async () => {
    setOtp('')
    setError(null)

    resentOtp().then(() => {
      setOtpResetNotification(I18n.t('auth.otp.resend_success'))
      const nextOtpTime = Date.now() + RESEND_OTP_DELAY * 1000
      localStorage.setItem(`nextOtpTime_${mobileNumber}`, nextOtpTime.toString())
      setResendCount(resendCount + 1)

      if (inputRef.current) {
        inputRef.current.focus()
      }
    }).catch(setError)
    setOtp('')
  }

  return (
    <div
      className={styles.otpVerificationContainer}
    >
      {error && (
        <div className={styles.errorContainer}>
          <Alert message={error} type="error" />
        </div>
      )}

      {otpResetNotification && (
        <Alert message={otpResetNotification} type="info" />
      )}

      <div className={styles.description}>
        {I18n.t('auth.otp.sms_description')}
      </div>
      <div className={styles.otpForm}>
        <Input
          ref={inputRef}
          size="large"
          className={styles.field}
          style={{ flex: 3, width: '100%' }}
          name="code"
          placeholder={I18n.t('auth.otp.code_placeholder')}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={otp}
          onChange={handleOtpChange}
          required
        />
        <Button
          style={{ flex: 1 }}
          type="primary"
          size="large"
          onClick={handleSubmit}
          loading={verificationCodeSending}
          disabled={!otp || resentOtpLoading}
        >
          {I18n.t('common.actions.verify')}
        </Button>

        <Button style={{ flex: 1 }} onClick={handleCancel} size="large">
          {I18n.t('common.actions.cancel')}
        </Button>
      </div>
      <Button
        href="#"
        type="link"
        className={styles.resendBtn}
        block
        onClick={handleResendOtp}
        loading={resentOtpLoading}
        disabled={remainingTime > 0}
      >
        {remainingTime > 0
          ? I18n.t('auth.otp.resend_in', { timestamp: Math.ceil(remainingTime / 1000) }) : I18n.t('auth.otp.resend')}
      </Button>
    </div>
  )
}

function getRemainingTime (mobileNumber: string): number {
  if (mobileNumber) {
    const nextOtpTime = localStorage.getItem(`nextOtpTime_${mobileNumber}`)
    if (nextOtpTime) {
      return parseInt(nextOtpTime, 10) - Date.now()
    }
  }
  return 0
}

export const OtpVerificationForm = connector(OtpVerificationComponent)
