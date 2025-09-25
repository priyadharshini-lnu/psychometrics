import _ from 'lodash'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { takeEvery, put } from 'redux-saga/effects'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import { createReducer, CustomAction } from '~/utils/redux'
import { updateIn } from '~/utils/immutable'
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

export const UPDATE_NORM = 'campaigns/userAssessments/UPDATE_NORM'
export const UPDATE_METTL_SCHEDULE = 'campaigns/userAssessments/UPDATE_METTL_SCHEDULE'
export const UPDATE_CONTENT_VARIATION = 'campaigns/userAssessments/UPDATE_CONTENT_VARIATION'
export const UPDATE_TIME_EXTENSION = 'campaigns/userAssessments/UPDATE_TIME_EXTENSION'
const RESCORE_RESPONSE = 'campaigns/userAssessments/RESCORE_RESPONSE'
export const SET_USER_ASSESSMENTS = 'campaigns/userAssessments/SET_USER_ASSESSMENTS'
export const RESET_PROGRESS_OF_ASSESSMENT = 'campaigns/userAssessments/RESET_PROGRESS_OF_ASSESSMENT'
export const GET_WEBHOOK_REQUEST_DATA = 'campaigns/userAssessments/GET_WEBHOOK_REQUEST_DATA'
export const SCHEDULE_ASSESSMENT = 'campaigns/userAssessments/SCHEDULE_ASSESSMENT'
export const TOGGLE_REQUIRE_SCHEDULE = 'campaigns/userAssessments/TOGGLE_REQUIRE_SCHEDULE'
export const TOGGLE_PREWORK = 'campaigns/userAssessments/TOGGLE_PREWORK'
export const NORMALIZE_FACTOR_SCORES = 'campaigns/userAssessments/NORMALIZE_FACTOR_SCORES'
export const MARK_USER_ASSESSMENT_COMPLETE = 'campaigns/userAssessments/MARK_USER_ASSESSMENT_COMPLETE'

export const get = (state): State => _.get(state, ['campaigns', 'userAssessments'])

export const getSingle = (state, id): UserAssessment | null => state.campaigns.userAssessments.list
  .find(assessment => assessment.id === id)

const statusLabel = { not_started: 'new', in_progress: 'progress' }

export const getStatusesCount = state => _.countBy(get(state).list, a => statusLabel[a.status] || a.status)

export const getWebhookPayload = (campaignId, userAssessmentId, body) => ({
  type: GET_WEBHOOK_REQUEST_DATA,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${userAssessmentId}/webhook_payload`,
    body: { ...body },
    loader: true,
  },
})

export const updateNorm = (campaignId, campaignAssessmentId: number, body) => ({
  type: UPDATE_NORM,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${campaignAssessmentId}/update_norm`,
    body: { ...body, campaignAssessmentId },
    loader: true,
  },
})

export const updateMettlSchedule = (campaignId, campaignAssessmentId: number, body) => ({
  type: UPDATE_METTL_SCHEDULE,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${campaignAssessmentId}/update_mettl_schedule`,
    body: { ...body, campaignAssessmentId },
    loader: true,
  },
})

export const updateContentVariation = (campaignId, campaignAssessmentId: number, body) => ({
  type: UPDATE_CONTENT_VARIATION,
  request: {
    method: 'put',
    // eslint-disable-next-line max-len
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${campaignAssessmentId}/update_content_variation`,
    body: { ...body, campaignAssessmentId },
    loader: true,
  },
})

export const updateSimulationTimeExtension = (campaignId, campaignAssessmentId: number, body) => ({
  type: UPDATE_TIME_EXTENSION,
  request: {
    method: 'put',
    // eslint-disable-next-line max-len
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${campaignAssessmentId}/update_simulation_time_extension`,
    body: { ...body, campaignAssessmentId },
    loader: true,
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

export const scheduleAssessment = (campaignId: number, campaignAssessmentId: number, {
  scheduleTime,
}: { scheduleTime: string }) => ({
  type: SCHEDULE_ASSESSMENT,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${campaignAssessmentId}/schedule_assessment`,
    loader: true,
    body: {
      scheduleTime,
    },
  },
})

export const toggleRequireScheduling = (campaignId: number, assessmentId: number, requireScheduling: boolean) => ({
  type: TOGGLE_REQUIRE_SCHEDULE,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${assessmentId}/toggle_require_scheduling`,
    body: {
      requireScheduling,
    },
  },
})

export const togglePrework = (campaignId: number, assessmentId: number, prework: boolean) => ({
  type: TOGGLE_PREWORK,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${assessmentId}/toggle_prework`,
    body: {
      prework,
    },
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

export const resetProgress = (campaignId: number, userAssessmentId: number) => ({
  type: RESET_PROGRESS_OF_ASSESSMENT,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${userAssessmentId}/reset_progress`,
  },
})

export const markComplete = (campaignId: number, userAssessmentId: number) => ({
  type: MARK_USER_ASSESSMENT_COMPLETE,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${userAssessmentId}/mark_complete`,
  },
})

export const normalizeFactorScores = (campaignId: number, userAssessmentId: number) => ({
  type: NORMALIZE_FACTOR_SCORES,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/user_assessments/${userAssessmentId}/normalize_factor_scores`,
  },
})

export interface State {
  list: UserAssessment[]
}

type FetchType = ApiActionResponse<{userAssessments: UserAssessment[]}>
type UpdateNormType = ApiActionResponse<{normName: string, normType: string}>
type UpdateMettlScheduleType = ApiActionResponse<{mettlScheduleName: string}>

const HANDLERS = {
  [SET_USER_ASSESSMENTS]: (state, { userAssessments }: CustomAction<{ userAssessments: UserAssessment[] }>) => (
    { ...state, list: userAssessments }),
  [SCHEDULE_ASSESSMENT]: (state, { response }: CustomAction<{ response: UserAssessment }>) => (
    { ...state, list: state.list.map(u => (u.id === response.id ? response : u)) }),
  [TOGGLE_REQUIRE_SCHEDULE]: (state, { response }: CustomAction<{ response: UserAssessment }>) => (
    { ...state, list: state.list.map(u => (u.id === response.id ? response : u)) }),
  [MARK_USER_ASSESSMENT_COMPLETE]: (state, { response }: CustomAction<{ response: UserAssessment }>) => (
    { ...state, list: state.list.map(u => (u.id === response.id ? response : u)) }
  ),
  [TOGGLE_PREWORK]: (state, { response }: CustomAction<{ response: UserAssessment }>) => (
    { ...state, list: state.list.map(u => (u.id === response.id ? response : u)) }),
  [UPDATE_NORM]: (state, { response, requestAction: { request } }: UpdateNormType) => {
    const { campaignAssessmentId, normId } = request.body
    const list = state.list.map((assessment: UserAssessment) => {
      if (assessment.id !== campaignAssessmentId) return assessment

      return { ...assessment, normId, ...response }
    })
    return { ...state, list }
  },
  [UPDATE_METTL_SCHEDULE]: (state, { response, requestAction: { request } }: UpdateMettlScheduleType) => {
    const { campaignAssessmentId, mettlScheduleRecordId } = request.body

    return updateIn(state, ['list'], (assessments: UserAssessment[]) => assessments.map(
      (assessment: UserAssessment) => {
        if (assessment.id !== campaignAssessmentId) return assessment

        return { ...assessment, mettlScheduleRecordId, ...response }
      },
    ))
  },
  [UPDATE_TIME_EXTENSION]: (state, { response, requestAction: { request } }: UpdateMettlScheduleType) => {
    const { campaignAssessmentId, timeExtension } = request.body

    return updateIn(state, ['list'], (assessments: UserAssessment[]) => assessments.map(
      (assessment: UserAssessment) => {
        if (assessment.id !== campaignAssessmentId) return assessment

        return { ...assessment, simuationTimeExtension: timeExtension, ...response }
      },
    ))
  },
}

function* genSetUserAssessments ({ response }: FetchType) {
  yield put(setUserAssessments(response.userAssessments))
}

export const watchers = [
  takeEvery(
    [
      FETCH_SINGLE_USER,
      CREATE_REPORT,
      REMOVE_REPORT,
      EXTEND_ASSESSMENT_TIME,
      REMOVE_ASSESSMENT,
      RESET_ASSESSMENT,
      RESET_PROGRESS_OF_ASSESSMENT,
    ],
    genSetUserAssessments,
  ),
]

export default createReducer(HANDLERS, defaultState)
