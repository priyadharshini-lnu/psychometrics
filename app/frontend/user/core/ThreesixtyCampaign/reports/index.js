const FETCH_REPORTS = 'threeSixty/managers/FETCH_REPORTS'

export const fetchCampaign = campaignId => ({
  type: FETCH_REPORTS,
  request: {
    url: `/campaigns/${campaignId}.json`,
  },
})

export const defaultState = {}

const HANDLERS = {
  [FETCH_REPORTS]: (state, action) => state, // do nothing action.data,
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
