import _ from 'lodash'
import { DEPRECATED_createReducer } from 'utils/redux'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'
import Norm from 'modules/admin/modules/campaigns/interfaces/Norm'
import { updateIn, setIn } from 'utils/immutable'
import { CREATE as CREATE_REPORT } from '../reports'
import {
  FETCH_ASSESSMENTS_AND_REPORTS,
} from '../current'
import {
  ACTIVATE_UNIVERSAL_LINK, REGENERATE_UNIVERSAL_LINK, DEACTIVATE_UNIVERSAL_LINK, FETCH_NORMS, UPDATE_NORM, REMOVE,
} from './actions'

const defaultState = {
  list: [],
}

export const get = (state): State => _.get(state, ['campaigns', 'assessments'])
export const getSingle = (state, id): Assessment | null => state.campaigns.assessments.list
  .find(assessment => assessment.id === id)

export interface FetchAction {
  response: {
    assessments: Assessment[],
  },
}

export interface FetchNormsAction {
  response: Norm[],
  requestAction: {
    request: {
      body: {
        id: number
      }
    }
  }
}
export interface UpdateNormAction {
  response: {
    normName: string
    normType: string
  },
  requestAction: {
    request: {
      body: {
        id: number
      }
    }
  }
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
  [FETCH_NORMS]: (state, { response, requestAction: { request } }: FetchNormsAction) => {
    const assessments = state.list.map((assessment: Assessment) => {
      if (assessment.id !== request.body.id) return assessment

      return { ...assessment, norms: response }
    })
    return setIn(state, ['list'], assessments)
  },
  [UPDATE_NORM]: (state, { response, requestAction: { request } }: UpdateNormAction) => {
    const assessments = state.list.map((assessment: Assessment) => {
      if (assessment.id !== request.body.id) return assessment

      return { ...assessment, ...response }
    })
    return setIn(state, ['list'], assessments)
  },
  [REMOVE]: (state: State, { response }: { response: number }) => (
    updateIn(state, ['list'], (assessments: Assessment[]) => _.filter(
      assessments, (assessment: Assessment) => assessment.id !== response,
    ))
  ),
}

export default DEPRECATED_createReducer(HANDLERS, defaultState)
