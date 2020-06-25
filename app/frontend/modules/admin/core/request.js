import _ from 'lodash'

export const LOADING = 'request/LOADING'
export const LOADING_COMPLETE = 'request/LOADING_COMPLETE'

export const get = state => _.get(state, ['request'])
export const isRequestInProgress = (state, name) => {
  const request = get(state)

  return request.loading && request.name === name
}
export const getLodingState = state => _.get(get(state), ['loading'])

export const loading = () => ({ type: LOADING, name })
export const loadingComplete = () => ({ type: LOADING_COMPLETE, name })

const defaultState = { loading: false, name: null }
export default function reducer (state = defaultState, { type, payload }) {
  switch (type) {
    case LOADING:
      return { loading: true, name: payload.name }
    case LOADING_COMPLETE:
      return defaultState
    default:
      return state
  }
}
