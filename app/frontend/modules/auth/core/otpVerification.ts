import ApiAction from 'interfaces/ApiAction'

type SendMobileNumberVerificationOtpRequestBody = {
  mobileNumber: string
  registrationCode: string | undefined
  smsInviteCode: string | undefined
  projectId?: number
}

export const SEND_MOBILE_NUMBER_VERIFICATION_OTP = 'mobile_number_verifications/SEND_OTP'
export const sendMobileNumberVerificationOtp = (
  body: SendMobileNumberVerificationOtpRequestBody,
): ApiAction<{}> => ({
  type: SEND_MOBILE_NUMBER_VERIFICATION_OTP,
  request: {
    url: '/mobile_number_verifications/send_verification_code',
    loader: true,
    method: 'POST',
    body,
  },
})
