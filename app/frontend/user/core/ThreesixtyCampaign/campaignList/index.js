import { setIn } from 'utils/immutable'

const FETCH = 'threeSixty/campaignList/FETCH'

export const fetchCampaigns = () => ({
  type: FETCH,
  request: {
    url: '/campaigns.json',
  },
})

export const defaultState = {
  campaigns: [],
}

const HANDLERS = {
  [FETCH]: (state, action) => setIn(state, ['campaigns'], action.response),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
