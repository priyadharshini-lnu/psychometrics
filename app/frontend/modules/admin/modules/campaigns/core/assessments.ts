import _ from 'lodash'
import { createReducer } from 'utils/redux'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'
import { FETCH_ASSESSMENTS_AND_REPORTS } from './current'
import { CREATE as CREATE_REPORT } from './reports'

export const IMPORT_RAW_RESULTS = 'campaigns/assessments/IMPORT_RAW_RESULTS'
export const IMPORT_SCORING_RESULTS = 'campaigns/assessments/IMPORT_SCORING_RESULTS'

const defaultState = {
  list: [],
}

export const get = (state): Assessment[] => _.get(state, ['campaigns', 'assessments'])

interface Body {
  file: File
}

export const importRawResults = (campaignId: number, assessmentId: number, body: Body) => ({
  type: IMPORT_RAW_RESULTS,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/import_results`,
    body,
    loader: true,
  },
})

export const importScoringResults = (campaignId: number, assessmentId: number, body: Body) => ({
  type: IMPORT_SCORING_RESULTS,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/import_results?scoring=true`,
    body,
    loader: true,
  },
})

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
