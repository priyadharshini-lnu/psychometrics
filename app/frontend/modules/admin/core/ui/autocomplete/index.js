const SEARCH = 'users/SEARCH'
export const defaultState = {
}

export const get = state => _.get(state, ['ui', 'autocomplete'])

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
