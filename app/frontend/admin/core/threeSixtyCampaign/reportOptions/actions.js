export const FETCH = 'threeSixty/option/FETCH'
export const UPDATE = 'threeSixty/option/UPDATE'
export const SYNC = 'threeSixty/option/SYNC'

export const fetch = campaignId => ({
  type: FETCH,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/options/report_options`,
    loader: true,
  },
})

export const syncWithServer = (campaignId, options) => ({
  type: SYNC,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/options/`,
    body: { reports: options },
  },
})

export const update = (key, value) => ({
  type: UPDATE,
  payload: { key, value },
})

