import ApiAction from 'interfaces/ApiAction'

export const CAMPAIGN_BY_ASSESSMENT_ID = 'campaigns/CAMPAIGN_BY_ASSESSMENT_ID'

export interface Factor {
  id: number
  name: string
}

export const fetchByAssessmentId = (assessmentId: number): ApiAction<Factor[]> => ({
  type: CAMPAIGN_BY_ASSESSMENT_ID,
  request: {
    method: 'get',
    url: `/administration/assessments/${assessmentId}/factors`,
  },
})
