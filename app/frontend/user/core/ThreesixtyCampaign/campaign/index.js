import mockdata from './mockdata'

const FETCH_CAMPAIGN = 'threeSixty/managers/FETCH_CAMPAIGN'

export const fetchCampaign = campaignId => ({
  type: FETCH_CAMPAIGN,
  request: {
    url: `/campaigns/${campaignId}.json`,
  },
})

export const defaultState = {
  nominations: [],
  evaluations: [],
  reports: [],
}

const HANDLERS = {
  [FETCH_CAMPAIGN]: (state, action) => state, // do nothing action.data,
}

// TODO: replace mockdata with defaultState
export default function reducer (state = mockdata, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
