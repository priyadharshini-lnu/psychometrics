import _ from 'lodash'
import { RootState } from 'modules/user/core/rootReducers'

export const get = (state: RootState) => _.get(state, ['examus'])

export const defaultState = {
  url: '',
  integrationName: '',
}

export default function reducer (state = defaultState) {
  return state
}
