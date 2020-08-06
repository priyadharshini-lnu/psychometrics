import _ from 'lodash'
import { createReducer } from 'utils/redux'
import UserAssessment from 'modules/admin/modules/campaigns/interfaces/UserAssessment'
import { FETCH_SINGLE } from './users'
import { CREATE as CREATE_REPORT } from './userReports'

const defaultState = {
  list: [],
}

export const get = (state): State => _.get(state, ['campaigns', 'userAssessments'])

const statusLabel = { not_started: 'new', in_progress: 'progress' }

export const getStatusesCount = state => _.countBy(get(state).list, a => statusLabel[a.status] || a.status)

export interface FetchAction {
  response: {
    userAssessments: UserAssessment[],
  },
}

export interface State {
  list: UserAssessment[]
}

const HANDLERS = {
  [FETCH_SINGLE]: (_, { response }: FetchAction) => ({ list: response.userAssessments }),
  [CREATE_REPORT]: (_, { response }: FetchAction) => ({ list: response.userAssessments }),
}

export default createReducer(HANDLERS, defaultState)
