import lodashGet from 'lodash/get'

import { RootState } from 'modules/admin/core/rootReducers'

export const LOADING = 'request/LOADING'
export const LOADING_COMPLETE = 'request/LOADING_COMPLETE'
export const RESPONSE_DATA_MISMATCHED = 'request/RESPONSE_DATA_MISMATCHED'
export const CLEAR_RESPONSE_DATA_MISMATCHED = 'request/CLEAR_RESPONSE_DATA_MISMATCHED'

export const get = (state: RootState): RequestState => lodashGet(state, ['request'])

type Request = {
  name: string,
  loading: boolean
}

type ResponseDataMismatchRequest = {
  requestName: string,
  errors: string
  data: unknown
}

type RequestState = {
  requests: Request[]
  responseDataMismatchRequest: ResponseDataMismatchRequest
}

export const isRequestInProgress = (state: RootState, name: string) => {
  const request = get(state).requests.find((request: Request) => request.name === name)

  if (request) {
    return request.loading
  }

  return false
}

/**
 * @deprecated used for compatibilty with WithSkeletonHOC, should be improved in LH-1913
 */
export const getLoadingState = (state: RootState) => get(state).requests.length !== 0

export const getResponseDataMismatchRequest = (state: RootState) => lodashGet(
  get(state), ['responseDataMismatchRequest'],
)

export const setResponseDataMismatched = (requestName: string, errors: string[], data: unknown) => ({
  type: RESPONSE_DATA_MISMATCHED,
  payload: { requestName, errors, data },
})

export const clearResponseDataMismatched = () => ({ type: CLEAR_RESPONSE_DATA_MISMATCHED })

const defaultState: RequestState = {
  requests: [],
  responseDataMismatchRequest: { requestName: '', errors: '', data: {} },
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
