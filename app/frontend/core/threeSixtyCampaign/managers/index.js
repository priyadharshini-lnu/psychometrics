const FETCH_MANAGERS = 'threeSixty/managers/FETCH_MANAGERS'
export const defaultState = []

export const fetchManagers = campaignId => ({
  type: FETCH_MANAGERS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/participants`,
    body: {
      q: {
        relationship_name_eq: 'Manager'
      }
    }
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
