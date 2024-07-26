import ApiAction from 'interfaces/ApiAction'

export const IMPORT = 'campaigns/factors/IMPORT'

export const importFactors = (campaignId: string, body: FormData): ApiAction<void> => ({
  type: IMPORT,
  campaignId,
  request: {
    method: 'post',
    url: `/api/v2/administration/campaigns/${campaignId}/campaign_factors/import`,
    body,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})
