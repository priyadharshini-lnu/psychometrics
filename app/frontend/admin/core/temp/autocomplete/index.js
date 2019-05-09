const SEARCH = 'temp/users/SEARCH'
export const defaultState = {
}

export const search = (url, source, q) => ({
  type: SEARCH,
  source,
  request: {
    method: 'post',
    url,
    body: {
      q,
    },
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case SEARCH:
      return { ...state, [action.requestAction.source]: action.response }
    default:
      return state
  }
}
