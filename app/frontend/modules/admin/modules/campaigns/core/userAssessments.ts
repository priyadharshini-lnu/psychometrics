import _ from 'lodash'
import { createReducer, CustomAction } from 'utils/redux'
import UserAssessment from 'modules/admin/modules/campaigns/interfaces/UserAssessment'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { takeEvery, put } from 'redux-saga/effects'
import {
  FETCH_SINGLE as FETCH_SINGLE_USER,
  REMOVE_ASSESSMENT,
  RESET_ASSESSMENT,
  EXTEND_ASSESSMENT_TIME,
  CREATE_REPORT,
  REMOVE_REPORT,
} from './users'

const defaultState = {
  list: [],
}

const UPDATE_NORM = 'campaigns/userAssessments/UPDATE_NORM'
const RESCORE_RESPONSE = 'campaigns/userAssessments/RESCORE_RESPONSE'
export const SET_USER_ASSESSMENTS = 'campaigns/userAssessments/SET_USER_ASSESSMENTS'

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
  type: EXTEND_ASSESSMENT_TIME,
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

export const reset = (campaignId: number, campaignAssessmentId: number) => ({
  type: RESET_ASSESSMENT,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${campaignAssessmentId}/reset`,
  },
})

export const remove = (campaignId: number, campaignAssessmentId: number) => ({
  type: REMOVE_ASSESSMENT,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${campaignAssessmentId}`,
  },
})

export const setUserAssessments = (userAssessments: UserAssessment[]) => ({
  type: SET_USER_ASSESSMENTS,
  userAssessments,
})

export interface State {
  list: UserAssessment[]
}

type FetchType = ApiActionResponse<{userAssessments: UserAssessment[]}>
type UpdateNormType = ApiActionResponse<{normName: string, normType: string}>

const HANDLERS = {
  [SET_USER_ASSESSMENTS]: (state, { userAssessments }: CustomAction<{ userAssessments: UserAssessment[] }>) => (
    { ...state, list: userAssessments }),
  [UPDATE_NORM]: (state, { response, requestAction: { request } }: UpdateNormType) => {
    const list = state.list.map((assessment: UserAssessment) => {
      if (assessment.id !== request.body.campaignAssessmentId) return assessment

      return { ...assessment, ...response }
    })
    return { ...state, list }
  },
}

function* genSetUserAssessments ({ response }: FetchType) {
  yield put(setUserAssessments(response.userAssessments))
}

export const watchers = [
  takeEvery(
    [FETCH_SINGLE_USER, CREATE_REPORT, REMOVE_REPORT, EXTEND_ASSESSMENT_TIME, REMOVE_ASSESSMENT, RESET_ASSESSMENT],
    genSetUserAssessments,
  ),
]

export default createReducer(HANDLERS, defaultState)
