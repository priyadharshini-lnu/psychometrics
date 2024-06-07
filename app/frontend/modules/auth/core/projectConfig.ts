import { createReducer } from '~/utils/redux'

type LoginBoxPosition = 'left' | 'right' | 'auto'
type BackgroundSize = 'cover' | 'contain'

interface State {
  id?: number
  client_logo: null | string,
  secondary_logo: null | string,
  background: null | string,
  background_color?: string,
  login_box_position: LoginBoxPosition,
  saml_login_allowed: boolean
  saml_enforced: boolean
  require_mobile_number: boolean
  primary_color?: string
  error_color?: string,
  warning_color?: string,
  success_color?: string,
  info_color?: string,
  background_size: BackgroundSize,
}

export const defaultState: State = {
  client_logo: null,
  secondary_logo: null,
  background: null,
  login_box_position: 'auto',
  saml_login_allowed: false,
  require_mobile_number: false,
  saml_enforced: false,
  background_size: 'cover',
}

export default createReducer({}, defaultState)
