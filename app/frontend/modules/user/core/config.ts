import _ from 'lodash'
import { RootState } from 'modules/user/core/rootReducers'

export const get = (state: RootState) => _.get(state, ['config'])
export const getMaintenanceDate = (state: RootState) => _.get(state, ['config', 'maintenance', 'startDate'])

export const defaultState = {
  agileAssetsUrl: '',
  maintenance: {
    startDate: null,
  },
}

export default function reducer (state = defaultState) {
  return state
}
