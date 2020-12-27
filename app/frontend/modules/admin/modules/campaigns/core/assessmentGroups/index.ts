import _ from 'lodash'
import { createSelector } from 'reselect'
import { createReducer } from 'utils/redux'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { CampaignAssessmentGroup, CampaignAssessment } from './interfaces'

const defaultState = {
  list: [],
  assessments: [],
}

export const getGroups = (state): CampaignAssessmentGroup[] => _.get(state, ['campaigns', 'assessmentGroups', 'list'])

export const getAssessments = (state): CampaignAssessment[] => _.get(
  state, ['campaigns', 'assessmentGroups', 'assessments'],
)

export const getSortedGroups = createSelector(getGroups, groups => _.sortBy(groups, ['position']))
export const getSortedAssessments = createSelector(
  getAssessments,
  (a, groupId) => groupId,
  (assessments, groupId) => _.sortBy(assessments.filter(a => a.campaignAssessmentGroupId === groupId), ['position']),
)


export const FETCH = 'resource/campaigns/assessment_groups/FETCH'
export const REMOVE = 'resource/campaigns/assessment_groups/REMOVE'
export const CREATE = 'resource/campaigns/assessment_groups/CREATE'
export const UPDATE = 'resource/campaigns/assessment_groups/UPDATE'
export const UPDATE_REQUEST = 'resource/campaigns/assessment_groups/UPDATE_REQUEST'
export const UPDATE_ASSESSMENT = 'resource/campaigns/assessment_groups/UPDATE_ASSESSMENT'
export const UPDATE_ASSESSMENT_REQUEST = 'resource/campaigns/assessment_groups/UPDATE_ASSESSMENT_REQUEST'
export const ATTACH_ASSESSMENT_TO_GROUP = 'resource/campaigns/assessment_groups/ATTACH_ASSESSMENT_TO_GROUP'
// eslint-disable-next-line max-len
export const ATTACH_ASSESSMENT_TO_GROUP_REQUEST = 'resource/campaigns/assessment_groups/ATTACH_ASSESSMENT_TO_GROUP_REQUEST'


export const fetch = (campaignId: number) => ({
  type: FETCH,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/campaign_assessment_groups`,
  },
})
export const update = (campaignId: number, id: number, body: object) => ({
  type: UPDATE,
  id,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/campaign_assessment_groups/${id}`,
    body: {
      resource: body,
    },
  },
})

export const updateAssessment = (campaignId: number, id: number, body: object) => ({
  type: UPDATE_ASSESSMENT,
  id,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/campaign_assessments/${id}`,
    body,
  },
})
export const attachAssessmentToGroup = (campaignId: number, id: number, groupId: number | null, position: number) => ({
  type: ATTACH_ASSESSMENT_TO_GROUP,
  id,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/campaign_assessments/${id}/attach_to_group`,
    body: {
      groupId,
      position,
    },
  },
})

export const remove = ({ campaignId, id }: CampaignAssessmentGroup) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/campaign_assessment_groups/${id}`,
  },
})

export interface RemoveAction {
  response: number
}

export interface ResourceResponse {
  response: CampaignAssessmentGroup
}


export interface State {
  list: CampaignAssessmentGroup[]
  assessments: CampaignAssessment[]
}

export interface FetchResponse {
  groups: CampaignAssessmentGroup[],
  assessments: CampaignAssessment[]
}
export interface UpdateResponse {
  id: number
  request: {
    body: {
      resource: object
    }
  }
}

type FetchType = ApiActionResponse<FetchResponse>
type CreateType = ApiActionResponse<CampaignAssessmentGroup>
type RemoveType = ApiActionResponse<CampaignAssessmentGroup>
type UpdateType = ReturnType<typeof update>
type UpdateAssessmentType = ReturnType<typeof updateAssessment>
type AttachAssessmentToGroupType = ReturnType<typeof attachAssessmentToGroup>

const HANDLERS = {
  [FETCH]: (_, { response }: FetchType) => ({ list: response.groups, assessments: response.assessments }),
  [CREATE]: (state, { response }: CreateType) => ({ ...state, list: [...state.list, response] }),
  [REMOVE]: (state, { response: id }: RemoveType) => ({
    list: state.list.filter(g => g.id !== id),
    assessments: state.assessments.map((a) => {
      if (a.campaignAssessmentGroupId === id) {
        return { ...a, campaignAssessmentGroupId: null }
      }
      return a
    }),
  }),
  [UPDATE_REQUEST]: (state, { request: { body }, id }: UpdateType): State => {
    const list = state.list.map(group => (group.id === id ? { ...group, ...body.resource } : group))
    return { ...state, list }
  },
  [UPDATE_ASSESSMENT_REQUEST]: (state, { request: { body }, id }: UpdateAssessmentType): State => {
    const assessments = state.assessments.map(a => (a.id === id ? { ...a, ...body } : a))
    return { ...state, assessments }
  },
  [ATTACH_ASSESSMENT_TO_GROUP_REQUEST]: (state, { id, request: { body } }: AttachAssessmentToGroupType): State => {
    // When we attach the assessment to particular position, we have to shift down all existing assessments
    // where position >= new assessment.position
    const assessments = state.assessments.map((a: CampaignAssessment) => {
      if (a.id === id) {
        return { ...a, position: body.position, campaignAssessmentGroupId: body.groupId }
      }
      if (a.position >= body.position && a.campaignAssessmentGroupId === body.groupId) {
        return { ...a, position: a.position + 1 }
      }
      return a
    })
    return { ...state, assessments }
  },
}

export default createReducer(HANDLERS, defaultState)
