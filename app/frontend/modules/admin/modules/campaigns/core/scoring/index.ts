export const IMPORT_EXTERNAL_CAMPAIGN_SCORE = 'campaigns/assessments/IMPORT_EXTERNAL_CAMPAIGN_SCORE'

export const importExternalCampaignScores = (campaignId: string, body: FormData) => ({
  type: IMPORT_EXTERNAL_CAMPAIGN_SCORE,
  request: {
    method: 'post',
    url: `/api/v2/administration/campaigns/${campaignId}/campaign_user_scorings/import_external_campaign_scorings`,
    body,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})
