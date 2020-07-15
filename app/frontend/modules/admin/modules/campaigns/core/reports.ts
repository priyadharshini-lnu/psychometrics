import _ from 'lodash'
import { createReducer } from 'utils/redux'
import Report from 'modules/admin/modules/campaigns/interfaces/Report'
import { FETCH_ASSESSMENTS_AND_REPORTS } from './current'

const defaultState = {
  list: [],
  selectedId: [],
}

export const get = (state): Report[] => _.get(state, ['campaigns', 'reports'])

export const CREATE = 'resource/campaigns/report/CREATE'

export interface FetchAction {
  response: {
    reports: Report[],
  },
}

export interface State {
  list: Report[]
}

const HANDLERS = {
  [FETCH_ASSESSMENTS_AND_REPORTS]: (_, { response }: FetchAction) => ({ list: response.reports }),
  [CREATE]: (_, { response }: FetchAction) => ({ list: response.reports }),
}

export default createReducer(HANDLERS, defaultState)
