import lodashGet from 'lodash/get'

export const LOADING = 'request/LOADING'
export const LOADING_COMPLETE = 'request/LOADING_COMPLETE'
export const RESPONSE_DATA_MISMATCHED = 'request/RESPONSE_DATA_MISMATCHED'
export const CLEAR_RESPONSE_DATA_MISMATCHED = 'request/CLEAR_RESPONSE_DATA_MISMATCHED'

export const get = state => lodashGet(state, ['request'])

export const isRequestInProgress = (state, name) => {
  const request = get(state).requests.find(request => request.name === name)

  if (request) {
    return request.loading
  }

  return false
}

/**
 * @deprecated used for compatibilty with WithSkeletonHOC, should be improved in LH-1913
 */
export const getLoadingState = state => get(state).requests.length !== 0

export const getResponseDataMismatchRequest = state => lodashGet(get(state), ['responseDataMismatchRequest'])

export const loading = () => ({ type: LOADING, name })
export const loadingComplete = () => ({ type: LOADING_COMPLETE, name })

export const setResponseDataMismatched = (requestName, errors, data) => ({
  type: RESPONSE_DATA_MISMATCHED,
  payload: { requestName, errors, data },
})

export const clearResponseDataMismatched = () => ({ type: CLEAR_RESPONSE_DATA_MISMATCHED })

const defaultState = {
  requests: [],
  responseDataMismatchRequest: {},
}

export default function reducer (state = defaultState, { type, payload }) {
  switch (type) {
    case LOADING: {
      const actionAlreadyExistsInLoading = state.requests.find(request => request.name === payload.name)

      if (actionAlreadyExistsInLoading) {
        return state
      }
      return { ...state, requests: [...state.requests, { loading: true, name: payload.name }] }
    }
    case LOADING_COMPLETE:
      return { ...state, requests: state.requests.filter(request => request.name !== payload.name) }
    case RESPONSE_DATA_MISMATCHED:
      return { ...state, responseDataMismatchRequest: payload }
    case CLEAR_RESPONSE_DATA_MISMATCHED:
      return { ...state, responseDataMismatchRequest: {} }
    default:
      return state
  }
}
