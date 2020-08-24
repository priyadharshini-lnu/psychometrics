import _ from 'lodash'
import { createReducer } from 'utils/redux'
import UserAssessment from 'modules/admin/modules/campaigns/interfaces/UserAssessment'
import { FETCH_SINGLE } from './users'
import { CREATE as CREATE_REPORT } from './userReports'

const defaultState = {
  list: [],
}

const UPDATE_NORM = 'campaigns/userAssessments/UPDATE_NORM'

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

export interface State {
  list: UserAssessment[]
}

const HANDLERS = {
  [FETCH_SINGLE]: (_, { response }: FetchAction) => ({ list: response.userAssessments }),
  [CREATE_REPORT]: (_, { response }: FetchAction) => ({ list: response.userAssessments }),
  [UPDATE_NORM]: (state, { response, requestAction: { request } }: UpdateNormAction) => {
    const list = state.list.map((assessment: UserAssessment) => {
      if (assessment.id !== request.body.campaignAssessmentId) return assessment

      return { ...assessment, ...response }
    })
    return { ...state, list }
  },
}

export default createReducer(HANDLERS, defaultState)
