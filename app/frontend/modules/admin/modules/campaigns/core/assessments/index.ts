import _ from 'lodash'
import { createReducer } from 'utils/redux'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'
import Norm from 'modules/admin/modules/campaigns/interfaces/Norm'
import { updateIn, setIn } from 'utils/immutable'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { CREATE as CREATE_REPORT } from '../reports'
import {
  FETCH_ASSESSMENTS_AND_REPORTS,
} from '../current'
import {
  ACTIVATE_UNIVERSAL_LINK,
  REGENERATE_UNIVERSAL_LINK,
  DEACTIVATE_UNIVERSAL_LINK,
  FETCH_NORMS, UPDATE_NORM,
  REMOVE, UPDATE_ASSESSOR_FORM,
  UPDATE_AVAILABLE_LOCALES,
} from './actions'

const defaultState: State = {
  list: [],
  selectedId: [],
  permissions: {
    enableUniversalLink: false,
    updateAvailableLocales: false,
  },
}

export const get = (state): State => _.get(state, ['campaigns', 'assessments'])
export const getSingle = (state, id): Assessment | null => state.campaigns.assessments.list
  .find(assessment => assessment.id === id)

export interface ActivateUniversalLinkAction {
  response: Assessment,
  requestAction: { campaignId: string }
}

export interface State {
  list: Assessment[]
  selectedId: number[],
  permissions: {
    enableUniversalLink: boolean
    updateAvailableLocales: boolean
  }
}

type ActivateUniversalLinkType = ApiActionResponse<Assessment>
type FetchType = ApiActionResponse<{assessments: Assessment[], permissions: { assessmentPermissions: {} }}>
type FetchNormsType = ApiActionResponse<Norm[]>
type UpdateNormType = ApiActionResponse<{normName: string}>
type UpdateAssessorForm = ApiActionResponse<{assessorFormName: string, assessorFormId: number | undefined}>
type UpdateAvailableLocales = ApiActionResponse<{ availableLocales: string[] }>
type RemoveType = ApiActionResponse<number>


const updateAssessment = (state: State, { response }: ActivateUniversalLinkType) => (
  updateIn(state, 'list', list => list.map(a => (a.id === response.id ? response : a)))
)

const HANDLERS = {
  [FETCH_ASSESSMENTS_AND_REPORTS]: (state: State, { response }: FetchType) => ({
    ...state, list: response.assessments, permissions: response.permissions.assessmentPermissions,
  }),
  [CREATE_REPORT]: (state, { response }: FetchType) => ({ ...state, list: response.assessments }),
  [ACTIVATE_UNIVERSAL_LINK]: updateAssessment,
  [DEACTIVATE_UNIVERSAL_LINK]: updateAssessment,
  [REGENERATE_UNIVERSAL_LINK]: updateAssessment,
  [FETCH_NORMS]: (state, { response, requestAction: { request } }: FetchNormsType) => {
    const assessments = state.list.map((assessment: Assessment) => {
      if (assessment.id !== request.body.id) return assessment

      return { ...assessment, norms: response }
    })
    return setIn(state, ['list'], assessments)
  },
  [UPDATE_NORM]: (state, { response, requestAction: { request } }: UpdateNormType) => {
    const assessments = state.list.map((assessment: Assessment) => {
      if (assessment.id !== request.body.id) return assessment

      return { ...assessment, ...response }
    })
    return setIn(state, ['list'], assessments)
  },
  [UPDATE_ASSESSOR_FORM]: (state, { response, requestAction: { request } }: UpdateAssessorForm) => {
    const assessments = state.list.map((assessment: Assessment) => {
      if (assessment.id !== request.body.id) return assessment

      return { ...assessment, ...response }
    })
    return setIn(state, ['list'], assessments)
  },
  [UPDATE_AVAILABLE_LOCALES]: (state: State, { response, requestAction: { request } }: UpdateAvailableLocales) => {
    const assessments = state.list.map((assessment: Assessment) => {
      if (assessment.id !== request.body.id) return assessment

      return { ...assessment, ...response }
    })
    return setIn(state, ['list'], assessments)
  },
  [REMOVE]: (state: State, { response }: RemoveType) => (
    updateIn(state, ['list'], (assessments: Assessment[]) => _.filter(
      assessments, (assessment: Assessment) => assessment.id !== response,
    ))
  ),
}

export default createReducer(HANDLERS, defaultState)
