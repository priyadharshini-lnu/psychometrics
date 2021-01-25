import _ from 'lodash'

export const LOADING = 'request/LOADING'
export const LOADING_COMPLETE = 'request/LOADING_COMPLETE'
export const RESPONSE_DATA_MISMATCHED = 'request/RESPONSE_DATA_MISMATCHED'
export const CLEAR_RESPONSE_DATA_MISMATCHED = 'request/CLEAR_RESPONSE_DATA_MISMATCHED'

export const get = state => _.get(state, ['request'])
export const isRequestInProgress = (state, name) => {
  const request = get(state).lastRequest

  return request.loading && request.name === name
}
export const getLoadingState = state => _.get(get(state), ['lastRequest', 'loading'])
export const getResponseDataMismatchRequest = state => _.get(get(state), ['responseDataMismatchRequest'])

export const loading = () => ({ type: LOADING, name })
export const loadingComplete = () => ({ type: LOADING_COMPLETE, name })

export const setResponseDataMismatched = (requestName, errors, data) => ({
  type: RESPONSE_DATA_MISMATCHED,
  payload: { requestName, errors, data },
})

export const clearResponseDataMismatched = () => ({ type: CLEAR_RESPONSE_DATA_MISMATCHED })

const defaultState = {
  lastRequest: {
    loading: false, name: null,
  },
  responseDataMismatchRequest: {},
}

export default function reducer (state = defaultState, { type, payload }) {
  switch (type) {
    case LOADING:
      return { ...state, lastRequest: { loading: true, name: payload.name } }
    case LOADING_COMPLETE:
      return defaultState
    case RESPONSE_DATA_MISMATCHED:
      return { ...state, responseDataMismatchRequest: payload }
    case CLEAR_RESPONSE_DATA_MISMATCHED:
      return { ...state, responseDataMismatchRequest: {} }
    default:
      return state
  }
}
