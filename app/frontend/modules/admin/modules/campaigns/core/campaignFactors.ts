import ApiAction from 'interfaces/ApiAction'

export const IMPORT = 'reports/upload_campaign_factors/IMPORT'
export const IMPORT_ASSESSMENT_CF = 'assessments/upload_campaign_factors/IMPORT'

export const importCampaignFactors = (reportId: number, body: FormData): ApiAction<void> => ({
  type: IMPORT,
  request: {
    method: 'post',
    url: `/administration/reports/${reportId}/builders/upload_campaign_factors`,
    body,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})

export const importAssessmentCFs = (assessmentId: number, body: FormData): ApiAction<void> => ({
  type: IMPORT_ASSESSMENT_CF,
  request: {
    method: 'post',
    url: `/administration/assessments/${assessmentId}/builders/upload_campaign_factors`,
    body,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})
