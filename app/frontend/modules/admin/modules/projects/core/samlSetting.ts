import _ from 'lodash'
import { RootState } from 'modules/admin/core/rootReducers'
import { createReducer } from 'utils/redux'

export const get = (state: RootState) => _.get(state, ['project', 'samlSetting'])

export interface State {
  id: number
  enabled: boolean
  enforced: boolean
  entityId: string
  ssoServiceUrl: string
  cert: string
  afterSignoutUrl: string
  assertionConsumerServiceUrl: string
  issuer: string
}

const defaultState = {} as State

export const UPDATE_SETTINGS = 'resource/campaigns/samlSetting/UPDATE'

const HANDLERS = {
}
export const reducer = createReducer(HANDLERS, defaultState)
