const RESET = 'threeSixty/RESET'
const RESET_NOMINATIONS = 'threeSixty/RESET_NOMINATIONS'

export const reset = campaignId => ({
  type: RESET,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/reset`,
  },
})

export const resetAllNominations = campaignId => ({
  type: RESET_NOMINATIONS,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/reset_nominations`,
  },
})
