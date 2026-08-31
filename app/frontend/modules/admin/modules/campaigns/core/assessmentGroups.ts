import * as t from 'io-ts'

import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import ApiAction from 'interfaces/ApiAction'

const CampaignAssessmentGroupTR = t.type({
  id: t.number,
  campaignId: t.number,
  name: t.string,
  position: t.number,
  previousAssessmentsRequired: t.boolean,
  previousGroupRequired: t.boolean,
  requirePreviousGroupsCompletionForBooking: t.boolean,
  campaignAssessmentIds: t.array(t.number),
  groupType: t.string,
})
export type CampaignAssessmentGroup = t.TypeOf<typeof CampaignAssessmentGroupTR>

const CampaignAssessmentTR = t.type({
  id: t.number,
  campaignId: t.number,
  assessmentId: t.number,
  name: t.string,
  position: t.number,
  campaignAssessmentGroupId: t.union([t.number, t.null]),
  workshopActivityDuration: t.union([t.number, t.null]),
})
export type CampaignAssessment = t.TypeOf<typeof CampaignAssessmentTR>

const GroupNameWithLocaleTR = t.type({
  name: t.union([t.string, t.null]),
  locale: t.string,
})
const FetchNameTranslationsResponseTR = t.type({
  list: t.array(GroupNameWithLocaleTR),
  availableLocales: t.array(t.string),
})
export type GroupNameWithLocale = t.TypeOf<typeof GroupNameWithLocaleTR>
export type FetchNameTranslationsResponse = t.TypeOf<typeof FetchNameTranslationsResponseTR>

export const FETCH = 'resource/campaigns/campaign_assessment_groups/FETCH'
export const FetchResponseTR = t.type({
  assessments: t.array(CampaignAssessmentTR),
  groups: t.array(CampaignAssessmentGroupTR),
})
type FetchResponse = t.TypeOf<typeof FetchResponseTR>
export const fetch = (campaignId: number): ApiAction<FetchResponse> => ({
  type: FETCH,
  request: {
    url: `/administration/new_campaigns/${campaignId}/campaign_assessment_groups`,
    method: 'get',
    loader: true,
    typedResponse: FetchResponseTR,
  },
})

export const CREATE = 'resource/campaigns/campaign_assessment_groups/CREATE'
const CreateResponseTR = CampaignAssessmentGroupTR
type CreateResponse = CampaignAssessmentGroup
export const create = (campaignId: number, position: number, groupType: string): ApiAction<CreateResponse> => ({
  type: CREATE,
  request: {
    url: `/administration/new_campaigns/${campaignId}/campaign_assessment_groups`,
    method: 'post',
    loader: true,
    body: {
      resource: {
        campaignId,
        name: `${groupType === 'assessment_center' ? 'Assessment Center' : 'Untitled group'} ${position}`,
        position,
        previousAssessmentsRequired: false,
        previousGroupRequired: false,
        campaignAssessmentGroupId: [],
        groupType,
      },
    },
    typedResponse: CreateResponseTR,
  },
})

export const UPDATE = 'resource/campaigns/campaign_assessment_groups/UPDATE'
const UpdateResponseTR = CampaignAssessmentGroupTR
type UpdateResponse = CampaignAssessmentGroup
export const update = (
  campaignId: number,
  id: number,
  data: Partial<CampaignAssessmentGroup>,
  locale = 'en',
): ApiAction<UpdateResponse> => ({
  type: UPDATE,
  id,
  request: {
    url: `/administration/new_campaigns/${campaignId}/campaign_assessment_groups/${id}`,
    method: 'put',
    loader: true,
    body: {
      resource: data,
      locale,
    },
    typedResponse: UpdateResponseTR,
  },
})

export const FETCH_NAME_TRANSLATIONS = 'resource/campaigns/campaign_assessment_groups/FETCH_NAME_TRANSLATIONS'
export const fetchNameTranslations = (
  campaignId: number,
  groupId: number,
  locales: Array<string | null>,
): ApiAction<FetchNameTranslationsResponse> => ({
  type: FETCH_NAME_TRANSLATIONS,
  request: {
    url: `/administration/new_campaigns/${campaignId}/campaign_assessment_groups/${groupId}/fetch_name_translations`,
    method: 'get',
    body: {
      locales: locales.filter(locale => locale),
    },
    typedResponse: FetchNameTranslationsResponseTR,
  },
})

export const REMOVE = 'resource/campaigns/campaign_assessment_groups/REMOVE'
const RemoveResponseTR = t.number
export type RemoveResponse = t.TypeOf<typeof RemoveResponseTR>
export type RemoveAction = ApiActionResponse<RemoveResponse>
export const remove = (campaignId: number, id: number): ApiAction<RemoveResponse> => ({
  type: REMOVE,
  request: {
    url: `/administration/new_campaigns/${campaignId}/campaign_assessment_groups/${id}`,
    method: 'delete',
    loader: true,
    typedResponse: RemoveResponseTR,
  },
})

export const UPDATE_POSITION = 'resource/campaigns/campaign_assessment_groups/update_position'
export type UpdatePositionRequest = {
  id: number
  position: number
}
export const UpdatePositionResponseTR = FetchResponseTR
type UpdatePositionResponse = t.TypeOf<typeof UpdatePositionResponseTR>
export const updatePosition = (
  campaignId: number,
  data: Array<UpdatePositionRequest>,
): ApiAction<UpdatePositionResponse> => ({
  type: UPDATE_POSITION,
  request: {
    url: `/administration/new_campaigns/${campaignId}/campaign_assessment_groups/update_positions`,
    method: 'post',
    loader: true,
    typedResponse: UpdatePositionResponseTR,
    body: {
      campaign_assessment_groups: data,
    },
  },
})

export const UPDATE_POSITION_REQUEST = `${UPDATE_POSITION}_REQUEST`
export const UPDATE_POSITION_ASSESSMENT = 'resource/campaigns/campaign_assessments/update_position'
export type UpdateAssessmentPositionRequest = UpdatePositionRequest & {
  campaign_assessment_group_id: number | null
  workshop_activity_duration?: number | null
}
type UpdateAssessmentPositionResponse = t.TypeOf<typeof UpdatePositionResponseTR>
export const updateAssessmentPosition = (
  campaignId: number, data: Array<UpdateAssessmentPositionRequest>,
): ApiAction<UpdateAssessmentPositionResponse> => ({
  type: UPDATE_POSITION_ASSESSMENT,
  request: {
    url: `/administration/new_campaigns/${campaignId}/campaign_assessments/update_positions`,
    method: 'post',
    loader: true,
    typedResponse: UpdatePositionResponseTR,
    body: {
      campaign_assessments: data,
    },
  },
})
