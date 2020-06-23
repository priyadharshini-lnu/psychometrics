export const CAMPAIGN_BY_ASSESSMENT_ID = 'campaigns/CAMPAIGN_BY_ASSESSMENT_ID'

export const fetchByAssessmentId = (assessmentId: number) => ({
  type: CAMPAIGN_BY_ASSESSMENT_ID,
  request: {
    method: 'get',
    url: `/administration/assessments/${assessmentId}/factors`,
  },
})
