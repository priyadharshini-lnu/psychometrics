import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { takeEvery, put } from 'redux-saga/effects'
import UserAssessment from 'modules/admin/modules/campaigns/interfaces/UserAssessment'
import { updateIn } from 'utils/immutable'
import { AnyAction } from 'redux'
import { FETCH_SINGLE } from './users'
import { CREATE as CREATE_REPORT, removeReportByIds } from './userReports'

const defaultState = {
  list: [],
}

const UPDATE_NORM = 'campaigns/userAssessments/UPDATE_NORM'
const UPDATE_ADDITIONAL_TIME = 'campaigns/userAssessments/UPDATE_ADDITIONAL_TIME'
const RESCORE_RESPONSE = 'campaigns/userAssessments/RESCORE_RESPONSE'
const REMOVE = 'campaigns/userAssessments/REMOVE'

export const get = (state): State => _.get(state, ['campaigns', 'userAssessments'])

export const getSingle = (state, id): UserAssessment | null => state.campaigns.userAssessments.list
  .find(assessment => assessment.id === id)

const statusLabel = { not_started: 'new', in_progress: 'progress' }

export const getStatusesCount = state => _.countBy(get(state).list, a => statusLabel[a.status] || a.status)


export const updateNorm = (campaignId, campaignAssessmentId: number, body) => ({
  type: UPDATE_NORM,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${campaignAssessmentId}/update_norm`,
    body: { ...body, campaignAssessmentId },
  },
})


export const updateAdditionalTime = (campaignId: number, campaignAssessmentId: number, additionalTime: number) => ({
  type: UPDATE_ADDITIONAL_TIME,
  campaignAssessmentId,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${campaignAssessmentId}/update_additional_time`,
    body: { additionalTime },
  },
})

export const rescoreResponse = (campaignId: number, campaignAssessmentId: number) => ({
  type: RESCORE_RESPONSE,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${campaignAssessmentId}/rescore_response`,
  },
})

export const remove = (campaignId: number, campaignAssessmentId: number, options: { userReportsIds: number[] }) => ({
  type: REMOVE,
  options,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${campaignAssessmentId}`,
  },
})

export interface UpdateNormAction {
  response: {
    normName: string
    normType: string
  },
  requestAction: {
    request: {
      body: {
        campaignAssessmentId: number
      }
    }
  }
}


export interface FetchAction {
  response: {
    userAssessments: UserAssessment[],
  },
}
export interface UpdateAdditionalTimeAction {
  requestAction: {
    campaignAssessmentId: number
  }
  response: object
}

export interface State {
  list: UserAssessment[]
}

const HANDLERS = {
  [FETCH_SINGLE]: (_, { response }: FetchAction) => ({ list: response.userAssessments }),
  [CREATE_REPORT]: (_, { response }: FetchAction) => ({ list: response.userAssessments }),
  [UPDATE_ADDITIONAL_TIME]: (state, {
    requestAction: {
      campaignAssessmentId,
    },
    response,
  }: UpdateAdditionalTimeAction) => {
    const list = state.list.map((assessment: UserAssessment) => {
      if (assessment.id !== campaignAssessmentId) return assessment

      return { ...assessment, ...response }
    })
    return { ...state, list }
  },
  [REMOVE]: (state: State, { response }: { response: number }) => (
    updateIn(state, ['list'], (userAssessments: UserAssessment[]) => _.filter(
      userAssessments, (userAssessment: UserAssessment) => userAssessment.id !== response,
    ))
  ),
  [UPDATE_NORM]: (state, { response, requestAction: { request } }: UpdateNormAction) => {
    const list = state.list.map((assessment: UserAssessment) => {
      if (assessment.id !== request.body.campaignAssessmentId) return assessment

      return { ...assessment, ...response }
    })
    return { ...state, list }
  },
}

export default createReducer(HANDLERS, defaultState)

function* removeUserReports ({ requestAction: { options } }: AnyAction) {
  yield put(removeReportByIds(options.userReportsIds))
}

export const watchers = [
  takeEvery(REMOVE, removeUserReports),
]
