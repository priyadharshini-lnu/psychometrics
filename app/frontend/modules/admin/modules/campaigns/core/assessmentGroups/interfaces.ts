export interface CampaignAssessmentGroup {
  id: number
  name: string
  position: number
  campaignId: number
  previousAssessmentsRequired: boolean
  previousGroupRequired: boolean
  assessments: Assessment[]
}

export interface Assessment {
  id: number
  name: string
  position: number
}
