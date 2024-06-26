import { createReducer } from '~/utils/redux'

interface UserAttributes {
  first_name: string
  last_name: string
  registration_code: string
  email: string
  mobile_number: string
  mobile_verification_token?: string
  reset_password_token?: string
  sms_invite_code?: string
  invitation_token?: string
}

type State = UserAttributes

export const defaultState: State = {
  first_name: '',
  last_name: '',
  registration_code: '',
  email: '',
  mobile_number: '',
}

export default createReducer({}, defaultState)
