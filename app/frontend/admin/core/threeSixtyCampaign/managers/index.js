const FETCH_MANAGERS = 'threeSixty/managers/FETCH_MANAGERS'
export const defaultState = { list: [], total: 0 }

export const fetchManagers = (campaignId, page) => ({
  type: FETCH_MANAGERS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/managers`,
    body: {
      page,
    },
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_MANAGERS:
      return { ...state, list: action.response.managers, total: action.response.total }
    default:
      return state
  }
}
