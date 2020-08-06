import _ from 'lodash'
import { createReducer } from 'utils/redux'
import UserReport from 'modules/admin/modules/campaigns/interfaces/UserReport'
import { FETCH_SINGLE } from './users'

const defaultState = {
  list: [],
}

export const get = (state): UserReport[] => _.get(state, ['campaigns', 'userReports'])

export const CREATE = 'resource/userReport/report/CREATE'

export interface FetchAction {
  response: {
    userReports: UserReport[],
  },
}

export interface State {
  list: UserReport[]
}

const HANDLERS = {
  [FETCH_SINGLE]: (_, { response }: FetchAction) => ({ list: response.userReports }),
  [CREATE]: (_, { response }: FetchAction) => ({ list: response.userReports }),
}

export default createReducer(HANDLERS, defaultState)
