import _ from 'lodash'
import { createReducer } from 'utils/redux'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'
import { FETCH_ASSESSMENTS_AND_REPORTS } from './current'
import { CREATE as CREATE_REPORT } from './reports'

const defaultState = {
  list: [],
}

export const get = (state): Assessment[] => _.get(state, ['campaigns', 'assessments'])

export interface FetchAction {
  response: {
    assessments: Assessment[],
  },
}

export interface State {
  list: Assessment[]
  selectedId: number[],
}

const HANDLERS = {
  [FETCH_ASSESSMENTS_AND_REPORTS]: (_, { response }: FetchAction) => ({ list: response.assessments }),
  [CREATE_REPORT]: (_, { response }: FetchAction) => ({ list: response.assessments }),
}

export default createReducer(HANDLERS, defaultState)
