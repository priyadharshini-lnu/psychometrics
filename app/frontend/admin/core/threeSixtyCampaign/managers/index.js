const FETCH_MANAGERS = 'threeSixty/managers/FETCH_MANAGERS'
export const defaultState = []

export const fetchManagers = campaignId => ({
  type: FETCH_MANAGERS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/managers`,
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_MANAGERS:
      return action.response
    default:
      return state
  }
}
