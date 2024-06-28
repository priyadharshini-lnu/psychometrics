import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Modal, Button, Typography, Form,
  Alert,
} from 'antd'
import { InputField } from '../../components/InputField'
import styles from './styles.less'
import { RootState } from '../../core/reducers'
import {
  sendMobileNumberVerificationOtp,
} from '../../core/otpVerification'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import {
  AsyncRequestResponseTR,
  AsyncRequestResponse,
} from '~/modules/admin/modules/client/core/asyncRequestResponse'

interface OtpVerificationProps {
  mobileNumber: string
  registrationCode: string | undefined
  smsInviteCode: string | undefined
  visible: boolean
  onCancel: () => void
  onVerificationSuccess: (verificationToken: string) => void
}

const connector = connect((state: RootState) => (state), {
  sendMobileNumberVerificationOtp,
})

const { I18n } = window
export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & OtpVerificationProps

const OtpVerificationComponent: React.FC<Props> = ({
  projectConfig,
  mobileNumber,
  registrationCode,
  smsInviteCode,
  visible,
  onCancel,
  onVerificationSuccess,
  sendMobileNumberVerificationOtp,
}) => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [otpResetNotification, setOtpResetNotification] = useState(null)

  const handleCancel = () => {
    setError(null)
    setLoading(false)
    setOtp('')

    onCancel()
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value)
    setOtpResetNotification(null)
  }

  const {
    makeAsyncRequest,
  } = useAsyncRequestResponse<AsyncRequestResponse>({
    url: '/mobile_number_verifications/verify',
    data: { mobileNumber, verificationCode: otp },
    responseType: AsyncRequestResponseTR,
    onFailure: (response) => {
      const { errorMessage } = response.responseData

      setError(errorMessage || I18n.t('common.errors.something_wrong'))
      setLoading(false)
    },
  })

  const handleSubmit = () => {
    setLoading(true)

    makeAsyncRequest().then((response) => {
      const { verificationToken } = response.responseData

      setError(null)
      setLoading(false)

      onVerificationSuccess(verificationToken)
    }).catch(setError).finally(() => {
      setLoading(false)
    })
  }

  const handleResendOtp = async () => {
    sendMobileNumberVerificationOtp({
      mobileNumber, registrationCode, smsInviteCode, projectId: projectConfig.id,
    }).then(() => {
      setOtpResetNotification(I18n.t('auth.otp.resend_success'))
    }).catch(setError)
    setOtp('')
  }

  return (
    <Modal
      title={I18n.t('auth.otp.title')}
      visible={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button key="verify" type="primary" onClick={handleSubmit} loading={loading} disabled={!otp}>
          {I18n.t('common.actions.verify')}
        </Button>,
      ]}
    >
      <Form
        layout="vertical"
      >
        <Typography.Paragraph className={styles.description}>
          {I18n.t('auth.otp.sms_description')}
        </Typography.Paragraph>

        {error && (
          <div className={styles.errorContainer}>
            <Alert message={error} type="error" />
          </div>
        )}

        {otpResetNotification && (
          <Alert message={otpResetNotification} type="info" />
        )}

        <InputField
          label={I18n.t('auth.otp.code')}
          name="code"
          placeholder={I18n.t('auth.otp.code_placeholder')}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={otp}
          onChange={handleOtpChange}
          required
        />

        <Button href="#" type="link" className={styles.resendBtn} block onClick={handleResendOtp}>
          {I18n.t('auth.otp.resend')}
        </Button>
      </Form>
    </Modal>
  )
}

export const OtpVerificationModal = connector(OtpVerificationComponent)
