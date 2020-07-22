const FETCH = 'campaignList/FETCH'
const LOGIN_HOGAN = 'campaignList/LOGIN_HOGAN'
const ACCEPT_POLICY = 'campaignList/ACCEPT_POLICY'

export const fetchCampaigns = () => ({
  type: FETCH,
  request: {
    url: '/dashboard',
  },
})

export const loginHogan = url => ({
  type: LOGIN_HOGAN,
  request: {
    method: 'PUT',
    url,
  },
})

export const acceptPolicy = () => ({
  type: ACCEPT_POLICY,
  request: {
    method: 'POST',
    url: '/assigns/accept_privacy',
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
