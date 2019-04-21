const FETCH_EVALUATION = 'threeSixty/managers/FETCH_EVALUATION'

export const fetchCampaign = campaignId => ({
  type: FETCH_EVALUATION,
  request: {
    url: `/campaigns/${campaignId}.json`,
  },
})

export const defaultState = {}

const HANDLERS = {
  [FETCH_EVALUATION]: (state, action) => state, // do nothing action.data,
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
