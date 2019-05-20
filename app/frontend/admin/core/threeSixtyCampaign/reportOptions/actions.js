export const FETCH_REPORT_OPTIONS = 'threeSixty/option/FETCH_REPORT_OPTIONS'
export const UPDATE_REPORT_OPTIONS = 'threeSixty/option/UPDATE_REPORT_OPTIONS'
export const SYNC_REPORT_OPTIONS = 'threeSixty/option/SYNC_REPORT_OPTIONS'


export const fetch = campaignId => ({
  type: FETCH_REPORT_OPTIONS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/options/report_options`,
    loader: true,
  },
})

export const syncWithServer = (campaignId, options) => ({
  type: SYNC_REPORT_OPTIONS,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/options/`,
    body: { report_options: options },
  },
})

export const update = (key, value) => ({
  type: UPDATE_REPORT_OPTIONS,
  payload: { key, value },
})
