export const FETCH = 'threeSixty/option/FETCH'
export const UPDATE = 'threeSixty/option/UPDATE'
export const SYNC = 'threeSixty/option/SYNC'

export const fetch = (campaignId: number) => ({
  type: FETCH,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/options/report_options`,
    loader: true,
  },
})

export const syncWithServer = (campaignId: number, options) => ({
  type: SYNC,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/options/`,
    body: { reports: options },
  },
})

export const update = (key: string, value: {}) => ({
  type: UPDATE,
  payload: { key, value },
})

export type UpdateType = ReturnType<typeof update>
