import { createReducer } from '~/utils/redux'

type LoginBoxPosition = 'left' | 'right' | 'auto'
type BackgroundSize = 'cover' | 'contain'

interface State {
  id?: number
  client_logo: null | string,
  logo_alt_text: string,
  secondary_logo: null | string,
  background: null | string,
  background_overlay: null | string,
  background_color?: string,
  login_box_position: LoginBoxPosition,
  saml_login_allowed: boolean
  saml_enforced: boolean
  require_mobile_number: boolean
  hide_signup: boolean
  primary_color?: string
  error_color?: string,
  warning_color?: string,
  success_color?: string,
  info_color?: string,
  background_size: BackgroundSize,
  magic_link_enabled: boolean,
  disallow_password_login: boolean,
  enable_recaptcha?: boolean,
  external_logout_redirect_enabled?: boolean,
  external_logout_url?: string
  glint_ui?: boolean,
}

export const defaultState: State = {
  client_logo: null,
  logo_alt_text: '',
  secondary_logo: null,
  background: null,
  background_overlay: null,
  login_box_position: 'auto',
  saml_login_allowed: false,
  require_mobile_number: false,
  hide_signup: false,
  saml_enforced: false,
  background_size: 'cover',
  magic_link_enabled: false,
  disallow_password_login: false,
  enable_recaptcha: false,
  external_logout_redirect_enabled: false,
  glint_ui: false,
}

export default createReducer({}, defaultState)
