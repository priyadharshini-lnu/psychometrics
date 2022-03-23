export const constructCampaignUrl = (projectId: number, campaignId: number) => {
  if (campaignId && projectId) {
    return `/administration/projects/${projectId}/new_campaigns/${campaignId}`
  }
  return ''
}
