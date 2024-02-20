export const constructCampaignUrl = (projectId: number, campaignId: number) => {
  if (campaignId && projectId) {
    return `/admin/projects/${projectId}/new_campaigns/${campaignId}`
  }
  return ''
}
