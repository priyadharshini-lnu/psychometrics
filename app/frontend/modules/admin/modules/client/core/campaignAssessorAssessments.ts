import * as t from 'io-ts'
import { createZutandStoreForJsonApi } from '~/hooks/useResources/utils'

export const campaignAssessorAssessmentTR = t.type({
  id: t.string,
  assessmentId: t.number,
  campaignId: t.number,
  assessmentName: t.union([t.string, t.null]),
  dimensionId: t.union([t.number, t.null]),
  allowMultipleResponses: t.boolean,
  campaignAssessmentGroupId: t.number,
  createdAt: t.union([t.string, t.null]),
  owner: t.union([t.type({
    id: t.union([t.string, t.number]),
    name: t.union([t.string, t.null]),
  }), t.null]),
  tenantId: t.union([t.number, t.null]),
})

export type CampaignAssessorAssessments = t.TypeOf<typeof campaignAssessorAssessmentTR>

export const useCampaignAssessorAssessmentsStore = createZutandStoreForJsonApi<CampaignAssessorAssessments[]>(
  'campaign_assessor_assessments',
)
