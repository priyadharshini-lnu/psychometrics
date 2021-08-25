import _ from 'lodash'
import { RootState } from 'modules/admin/core/rootReducers'

export const get = (state: RootState) => _.get(state, ['project', 'smtpSetting'])

interface State {
  id: number
  host: string
  encryption: string
  port: number
  userName: string
  password: string
  authenticationType: string
  enabled: boolean
}

const defaultState = {} as State

export function reducer (state = defaultState) {
  return state
}
