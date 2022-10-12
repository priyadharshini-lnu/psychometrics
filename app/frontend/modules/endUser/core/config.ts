import _ from 'lodash'
import { RootState } from 'modules/endUser/core/rootReducers'

export const get = (state: RootState) => _.get(state, ['config'])
export const getMaintenanceDate = (state: RootState) => _.get(state, ['config', 'maintenance', 'startDate'])

export const defaultState = {
  agileAssetsUrl: '',
  maintenance: {
    startDate: null,
  },
  profile: {
    fields: [],
    requiredFields: {},
    lockedFields: {},
  },
}

export default function reducer (state = defaultState) {
  return state
}
