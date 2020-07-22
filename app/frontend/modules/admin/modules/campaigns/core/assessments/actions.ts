export const ACTIVATE_UNIVERSAL_LINK = 'campaigns/ACTIVATE_UNIVERSAL_LINK'
export const DEACTIVATE_UNIVERSAL_LINK = 'campaigns/DEACTIVATE_UNIVERSAL_LINK'
export const REGENERATE_UNIVERSAL_LINK = 'campaigns/REGENERATE_UNIVERSAL_LINK'

export const activateUniversalLink = (campaignId: string, id: number) => ({
  type: ACTIVATE_UNIVERSAL_LINK,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/universal_links/${id}/activate`,
  },
  campaignId,
})

export const deactivateUniversalLink = (campaignId: string, id: number) => ({
  type: DEACTIVATE_UNIVERSAL_LINK,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/universal_links/${id}`,
  },
})

export const regenerateUniversalLink = (campaignId: string, id: number) => ({
  type: REGENERATE_UNIVERSAL_LINK,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/universal_links/${id}`,
  },
  campaignId,
})
