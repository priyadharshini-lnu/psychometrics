import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { CampaignAssessmentGroup, Assessment } from './interfaces'

const defaultState = {
  list: [],
  ungrouped: [],
}

export const getGroups = (state): CampaignAssessmentGroup[] => _.get(state, ['campaigns', 'assessmentGroups', 'list'])
export const getUngroupedAssessments = (state): Assessment[] => _.get(
  state, ['campaigns', 'assessmentGroups', 'ungrouped'],
)

export const FETCH = 'resource/campaigns/assessment_groups/FETCH'
export const REMOVE = 'resource/campaigns/assessment_groups/REMOVE'
export const CREATE = 'resource/campaigns/assessment_groups/CREATE'
export const UPDATE = 'resource/campaigns/assessment_groups/UPDATE'

export const fetch = (campaignId: number) => ({
  type: FETCH,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/campaign_assessment_groups`,
  },
})
export const update = ({ campaignId, id }: CampaignAssessmentGroup, body: object) => ({
  type: UPDATE,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/campaign_assessment_groups/${id}`,
    body,
  },
})

export const remove = ({ campaignId, id }: CampaignAssessmentGroup) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/campaign_assessment_groups/${id}`,
  },
})

export interface FetchAction {
  response: {
    groups: CampaignAssessmentGroup[],
    ungrouped: Assessment[]
  },
}
export interface RemoveAction {
  response: number
}

export interface ResourceResponse {
  response: CampaignAssessmentGroup
}

export interface State {
  list: CampaignAssessmentGroup[]
  ungrouped: Assessment[]
}

const HANDLERS = {
  [FETCH]: (_, { response }: FetchAction) => ({ list: response.groups, ungrouped: response.ungrouped }),
  [CREATE]: (state, { response }: ResourceResponse) => ({ ...state, list: [...state.list, response] }),
  [REMOVE]: (state, { response: id }: ResourceResponse) => {
    const removedGroup = state.list.find(group => group.id === id)
    return {
      list: state.list.filter(g => g.id !== id),
      ungrouped: [...state.ungrouped, ...removedGroup.assessments],
    }
  },
  [UPDATE]: (state, { response }: ResourceResponse) => {
    const list = state.list.map(group => (group.id === response.id ? response : group))
    return { ...state, list }
  },
}

export default createReducer(HANDLERS, defaultState)
