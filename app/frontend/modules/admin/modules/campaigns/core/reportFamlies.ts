export const FETCH = 'campaigns/reportFamily/FETCH'

export const fetch = (campaignId: string) => ({
  type: FETCH,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/reports/report_families`,
  },
})
