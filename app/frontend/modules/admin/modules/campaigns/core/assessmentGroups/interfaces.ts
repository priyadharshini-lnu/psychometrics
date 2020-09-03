export interface CampaignAssessmentGroup {
  id: number
  name: string
  position: number
  campaignId: number
  previousAssessmentsRequired: boolean
  previousGroupRequired: boolean
  assessments: CampaignAssessment[]
}

export interface CampaignAssessment {
  id: number
  assessmentId: number
  campaignAssessmentGroupId: number
  name: string
  position: number
  campaignId: number
}
