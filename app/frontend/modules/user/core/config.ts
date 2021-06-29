import _ from 'lodash'
import { RootState } from 'modules/user/core/rootReducers'

export const get = (state: RootState) => _.get(state, ['config'])

export const defaultState = {
  agileAssetsUrl: '',
}

export default function reducer (state = defaultState) {
  return state
}
