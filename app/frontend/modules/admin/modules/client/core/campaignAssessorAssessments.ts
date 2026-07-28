import * as t from 'io-ts'
import { createZutandStoreForJsonApi } from '~/hooks/useResources/utils'

export const campaignAssessorAssessmentTR = t.type({
  id: t.string,
  assessmentId: t.number,
  campaignId: t.number,
  assessmentName: t.union([t.string, t.null]),
  allowMultipleResponses: t.boolean,
  campaignAssessmentGroupId: t.number,
  tenant_id: t.number,
})

export type CampaignAssessorAssessments = t.TypeOf<typeof campaignAssessorAssessmentTR>

export const useCampaignAssessorAssessmentsStore = createZutandStoreForJsonApi<CampaignAssessorAssessments[]>(
  'campaign_assessor_assessments',
)
