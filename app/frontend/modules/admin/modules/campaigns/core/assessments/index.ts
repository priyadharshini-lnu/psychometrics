import _ from 'lodash'
import * as t from 'io-ts'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import ApiAction from 'interfaces/ApiAction'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { OtherAssessment, OtherAssessmentTR } from '~/modules/admin/modules/campaigns/interfaces/OtherAssessment'
import Norm from '~/modules/admin/modules/campaigns/interfaces/Norm'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import { updateIn, setIn } from '~/utils/immutable'
import { createReducer } from '~/utils/redux'
import { CREATE as CREATE_REPORT } from '../reports'
import { FETCH_ASSESSMENTS_AND_REPORTS } from '../current'

import {
  REGENERATE_UNIVERSAL_LINK,
  ENABLE_UNIVERSAL_LINK,
  SAVE_UNIVERSAL_LINK,
  FETCH_NORMS, UPDATE_NORM,
  REMOVE, UPDATE_ASSESSOR_FORM,
  UPDATE_AVAILABLE_LOCALES,
  UPDATE_EXTERNAL_CONFIG,
  UPDATE_PREWORK,
  UPDATE_WORKSHOP_ACTIVITY,
  SCHEDULE_ASSESSMENT,
  TOGGLE_REQUIRE_SCHEDULE,
  TOGGLE_AUTO_ASSIGN,
  TOGGLE_ASSESSMENT_CACHING,
  UPDATE_METTL_SCHEDULE,
  UPDATE_MHS_CONFIDENCE_INTERVAL,
  UPDATE_MHS_LEADERSHIP_BAR,
  UPDATE_MHS_NORM_REGION,
  UPDATE_MHS_NORM_OPTION,
  UPDATE_PROCTORING_SETTINGS,
  UPDATE_OCCUPATION_CONDITION_SET,
} from './actions'

const defaultState: State = {
  list: [],
  other: {
    list: [],
    total: 0,
  },
  selectedId: [],
  permissions: {
    enableUniversalLink: false,
    updateNorm: false,
    updateAssessorForm: false,
    updateAvailableLocales: false,
    toggleAutoAssign: false,
    toggleRequireScheduling: false,
    updatePrework: false,
  },
}

export const FETCH_OTHER_ASSESSMENTS = 'campaigns/FETCH_OTHER_ASSESSMENTS'

export const get = (state): State => _.get(state, ['campaigns', 'assessments'])
export const getOther = (state): State['other'] => _.get(state, ['campaigns', 'assessments', 'other'])
export const getSingle = (state, id): Assessment | null => state.campaigns.assessments.list
  .find(assessment => assessment.id === id)

export interface ActivateUniversalLinkAction {
  response: Assessment,
  requestAction: { campaignId: string }
}

export interface State {
  list: Assessment[],
  other: {
    list: OtherAssessment[],
    total: number
  },
  selectedId: number[],
  permissions: {
    enableUniversalLink: boolean
    updateNorm: boolean
    updateAssessorForm: boolean
    updateAvailableLocales: boolean
    toggleAutoAssign: boolean
    toggleRequireScheduling: boolean
    updatePrework: boolean
  }
}

type ActivateUniversalLinkType = ApiActionResponse<Assessment>
type FetchType = ApiActionResponse<{
  assessments: Assessment[],
  permissions: { assessmentPermissions: {} }
}>

type FetchNormsType = ApiActionResponse<Norm[]>
type UpdateNormType = ApiActionResponse<{ normName: string }>
type UpdateMettlScheduleType = ApiActionResponse<{ mettlScheduleName: string }>
type UpdateAssessorForm = ApiActionResponse<{ assessorFormName: string, assessorFormId: number | undefined }>
type UpdateAvailableLocales = ApiActionResponse<{ availableLocales: string[] }>
type RemoveType = ApiActionResponse<number>

const updateAssessment = (state: State, { response }: ActivateUniversalLinkType) => (
  updateIn(state, 'list', list => list.map(a => (a.id === response.id ? response : a)))
)

const FetchOtherAssessmentsResponseTR = t.type({
  total: t.number,
  list: t.array(OtherAssessmentTR),
})

type FetcOtherAssessmentsResponse = t.TypeOf<typeof FetchOtherAssessmentsResponseTR>

export type FetchOtherAssessmentsAction = ApiActionResponse<FetcOtherAssessmentsResponse>
export const fetchOtherAssessments = (
  campaignId: string, tableConfig?: TableConfig,
): ApiAction<FetcOtherAssessmentsResponse> => ({
  type: FETCH_OTHER_ASSESSMENTS,
  request: {
    tableConfig,
    typedResponse: FetchOtherAssessmentsResponseTR,
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/assessments/other`,
  },
})


const HANDLERS = {
  [FETCH_ASSESSMENTS_AND_REPORTS]: (state: State, { response }: FetchType) => ({
    ...state,
    list: response.assessments,
    permissions: response.permissions.assessmentPermissions,
  }),
  [FETCH_OTHER_ASSESSMENTS]: (state: State, { response }: FetchOtherAssessmentsAction) => ({
    ...state,
    other: response,
  }),
  [CREATE_REPORT]: (state, { response }: FetchType) => ({ ...state, list: response.assessments }),
  [ENABLE_UNIVERSAL_LINK]: updateAssessment,
  [SAVE_UNIVERSAL_LINK]: updateAssessment,
  [REGENERATE_UNIVERSAL_LINK]: updateAssessment,
  [UPDATE_EXTERNAL_CONFIG]: updateAssessment,
  [FETCH_NORMS]: (state, { response, requestAction: { request } }: FetchNormsType) => {
    const assessments = state.list.map((assessment: Assessment) => {
      if (assessment.id !== request.body.id) return assessment

      return { ...assessment, norms: response }
    })
    return setIn(state, ['list'], assessments)
  },
  [UPDATE_NORM]: (state, { response, requestAction: { request } }: UpdateNormType) => {
    const { id: requestId, normId } = request.body
    const assessments = state.list.map((assessment: Assessment) => {
      if (assessment.id !== requestId) return assessment

      return { ...assessment, normId, ...response }
    })
    return setIn(state, ['list'], assessments)
  },
  [UPDATE_METTL_SCHEDULE]: (state, { response, requestAction: { request } }: UpdateMettlScheduleType) => {
    const { id: requestId, mettlScheduleRecordId } = request.body

    return updateIn(state, ['list'], (assessments: Assessment[]) => assessments.map((assessment: Assessment) => {
      if (assessment.id !== requestId) return assessment

      return { ...assessment, mettlScheduleRecordId, ...response }
    }))
  },
  [SCHEDULE_ASSESSMENT]: (state, { response }: ApiActionResponse<Assessment>) => (
    updateIn(state, ['list'], (assessments: Assessment[]) => _.map(assessments, assessment => (
      assessment.id === response.id ? response : assessment
    )))
  ),
  [TOGGLE_REQUIRE_SCHEDULE]: (state, { response }: ApiActionResponse<Assessment>) => (
    updateIn(state, ['list'], (assessments: Assessment[]) => _.map(assessments, assessment => (
      assessment.id === response.id ? response : assessment
    )))
  ),
  [TOGGLE_AUTO_ASSIGN]: (state, { response }: ApiActionResponse<Assessment>) => (
    updateIn(state, ['list'], (assessments: Assessment[]) => _.map(assessments, assessment => (
      assessment.id === response.id ? response : assessment
    )))
  ),
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
  [UPDATE_PREWORK]: (state: State, { response }: ApiActionResponse<Assessment>) => (
    updateIn(state, ['list'], (assessments: Assessment[]) => _.map(assessments, assessment => (
      assessment.id === response.id ? response : assessment
    )))
  ),
  [UPDATE_WORKSHOP_ACTIVITY]: (state: State, { response }: ApiActionResponse<Assessment>) => (
    updateIn(state, ['list'], (assessments: Assessment[]) => _.map(assessments, assessment => (
      assessment.id === response.id ? response : assessment
    )))
  ),
  [TOGGLE_ASSESSMENT_CACHING]: (state, { response }: ApiActionResponse<Assessment>) => (
    updateIn(state, ['list'], (assessments: Assessment[]) => _.map(assessments, assessment => (
      assessment.id === response.id ? response : assessment
    )))
  ),
  [UPDATE_MHS_CONFIDENCE_INTERVAL]: (state, {
    response,
    requestAction: { request },
  }: ApiActionResponse<{ confidenceInterval: number }>) => {
    const { id: requestId } = request.body

    return updateIn(state, ['list'], (assessments: Assessment[]) => assessments.map((assessment: Assessment) => {
      if (assessment.id !== requestId) return assessment

      return {
        ...assessment,
        externalConfig: {
          ...assessment.externalConfig,
          confidenceInterval: response.confidenceInterval,
        },
      }
    }))
  },
  [UPDATE_MHS_LEADERSHIP_BAR]: (state, {
    response,
    requestAction: { request },
  }: ApiActionResponse<{ leadershipBar: number }>) => {
    const { id: requestId } = request.body

    return updateIn(state, ['list'], (assessments: Assessment[]) => assessments.map((assessment: Assessment) => {
      if (assessment.id !== requestId) return assessment

      return {
        ...assessment,
        externalConfig: {
          ...assessment.externalConfig,
          leadershipBar: response.leadershipBar,
        },
      }
    }))
  },
  [UPDATE_MHS_NORM_REGION]: (state, {
    response,
    requestAction: { request },
  }: ApiActionResponse<{ normRegion: number }>) => {
    const { id: requestId } = request.body

    return updateIn(state, ['list'], (assessments: Assessment[]) => assessments.map((assessment: Assessment) => {
      if (assessment.id !== requestId) return assessment

      return {
        ...assessment,
        externalConfig: {
          ...assessment.externalConfig,
          normRegion: response.normRegion,
        },
      }
    }))
  },
  [UPDATE_MHS_NORM_OPTION]: (state, {
    response,
    requestAction: { request },
  }: ApiActionResponse<{ normOption: number }>) => {
    const { id: requestId } = request.body

    return updateIn(state, ['list'], (assessments: Assessment[]) => assessments.map((assessment: Assessment) => {
      if (assessment.id !== requestId) return assessment

      return {
        ...assessment,
        externalConfig: {
          ...assessment.externalConfig,
          normOption: response.normOption,
        },
      }
    }))
  },
  [UPDATE_PROCTORING_SETTINGS]: (state, { response }: ApiActionResponse<Assessment>) => (
    updateIn(state, ['list'], (assessments: Assessment[]) => _.map(assessments, assessment => (
      assessment.id === response.id ? response : assessment
    )))
  ),
  [UPDATE_OCCUPATION_CONDITION_SET]: (state, { response }: ApiActionResponse<Assessment>) => (
    updateIn(state, ['list'], (assessments: Assessment[]) => _.map(assessments, assessment => (
      assessment.campaignAssessmentId === response.campaignAssessmentId ? response : assessment
    )))
  ),
}

export default createReducer(HANDLERS, defaultState)
