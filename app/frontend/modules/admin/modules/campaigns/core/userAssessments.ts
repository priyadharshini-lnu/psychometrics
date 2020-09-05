import _ from 'lodash'
import { createReducer } from 'utils/redux'
import UserAssessment from 'modules/admin/modules/campaigns/interfaces/UserAssessment'
import { FETCH_SINGLE } from './users'
import { CREATE as CREATE_REPORT } from './userReports'

const defaultState = {
  list: [],
}

const UPDATE_NORM = 'campaigns/userAssessments/UPDATE_NORM'
const UPDATE_ADDITIONAL_TIME = 'campaigns/userAssessments/UPDATE_ADDITIONAL_TIME'
const RESCORE_RESPONSE = 'campaigns/userAssessments/RESCORE_RESPONSE'

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
  [UPDATE_NORM]: (state, { response, requestAction: { request } }: UpdateNormAction) => {
    const list = state.list.map((assessment: UserAssessment) => {
      if (assessment.id !== request.body.campaignAssessmentId) return assessment

      return { ...assessment, ...response }
    })
    return { ...state, list }
  },
}

export default createReducer(HANDLERS, defaultState)
