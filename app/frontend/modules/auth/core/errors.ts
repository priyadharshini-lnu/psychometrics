import { createReducer } from '~/utils/redux'

interface Errors {
  email: string[]
  base: string[]
  first_name?: string[]
  last_name?: string[]
  registration_code?: string[]
  password?: string[]
  password_confirmation?: string[]
  current_password?: string[]
  otp? :string[]
  mobile_number?: string[]
}

type State = Errors

export const defaultState: State = {
  base: [],
  email: [],
  first_name: [],
  last_name: [],
  registration_code: [],
}

export default createReducer({}, defaultState)
