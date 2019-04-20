const FETCH_MANAGERS = 'threeSixty/managers/FETCH_MANAGERS'
export const defaultState = []

const MANAGER = 1

export const fetchManagers = campaignId => ({
  type: FETCH_MANAGERS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/evaluators`,
    body: {
      q: {
        role_eq: MANAGER,
      },
    },
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_MANAGERS:
      return action.data
    default:
      return state
  }
}
