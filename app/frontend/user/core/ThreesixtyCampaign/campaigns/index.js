const FETCH = 'threeSixty/campaignList/FETCH'
const LOGIN_HOGAN = 'threeSixty/campaignList/LOGIN_HOGAN'

export const fetchCampaigns = () => ({
  type: FETCH,
  request: {
    url: '/campaigns',
  },
})

export const loginHogan = url => ({
  type: LOGIN_HOGAN,
  request: {
    method: 'PUT',
    url,
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
