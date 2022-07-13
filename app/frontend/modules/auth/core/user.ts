import { createReducer } from 'utils/redux'

interface UserAttributes {
  first_name: string
  last_name: string
  registration_code: string
  email: string
  reset_password_token?: string
  sms_invite_code?: string
}

type State = UserAttributes

export const defaultState: State = {
  first_name: '',
  last_name: '',
  registration_code: '',
  email: '',
}

export default createReducer({}, defaultState)
