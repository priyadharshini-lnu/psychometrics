import _ from 'lodash'
import { createReducer } from 'utils/redux'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'
import { updateIn } from 'utils/immutable'
import { CREATE as CREATE_REPORT } from '../reports'
import {
  FETCH_ASSESSMENTS_AND_REPORTS,
} from '../current'
import {
  ACTIVATE_UNIVERSAL_LINK, REGENERATE_UNIVERSAL_LINK, DEACTIVATE_UNIVERSAL_LINK,
} from './actions'

const defaultState = {
  list: [],
}

export const get = (state): Assessment[] => _.get(state, ['campaigns', 'assessments'])

export interface FetchAction {
  response: {
    assessments: Assessment[],
  },
}

export interface ActivateUniversalLinkAction {
  response: Assessment,
  requestAction: { campaignId: string }
}

export interface State {
  list: Assessment[]
  selectedId: number[],
}

const updateAssessment = (state, { response }: ActivateUniversalLinkAction) => (
  updateIn(state, 'list', list => list.map(a => (a.id === response.id ? response : a)))
)

const HANDLERS = {
  [FETCH_ASSESSMENTS_AND_REPORTS]: (_, { response }: FetchAction) => ({ list: response.assessments }),
  [CREATE_REPORT]: (_, { response }: FetchAction) => ({ list: response.assessments }),
  [ACTIVATE_UNIVERSAL_LINK]: updateAssessment,
  [DEACTIVATE_UNIVERSAL_LINK]: updateAssessment,
  [REGENERATE_UNIVERSAL_LINK]: updateAssessment,
}

export default createReducer(HANDLERS, defaultState)
