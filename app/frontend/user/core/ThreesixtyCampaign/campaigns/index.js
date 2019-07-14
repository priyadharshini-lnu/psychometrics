const FETCH = 'threeSixty/campaignList/FETCH'

export const fetchCampaigns = () => ({
  type: FETCH,
  request: {
    url: '/campaigns',
  },
})

export const defaultState = []

const HANDLERS = {
  [FETCH]: (_, action) => action.response,
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
