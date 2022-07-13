import { createReducer } from 'utils/redux'

type LoginBoxPosition = 'left' | 'right' | 'auto'

interface State {
  client_logo: null | string,
  secondary_logo: null | string,
  background: null | string,
  background_color: string,
  login_box_position: LoginBoxPosition,
  saml_login_allowed: boolean
  saml_enforced: boolean
}

export const defaultState: State = {
  client_logo: null,
  secondary_logo: null,
  background: null,
  background_color: '#0fa5ad',
  login_box_position: 'auto',
  saml_login_allowed: false,
  saml_enforced: false,
}

export default createReducer({}, defaultState)
