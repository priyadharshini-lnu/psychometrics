import _ from 'lodash'

export const LOADING = 'request/LOADING'
export const LOADING_COMPLETE = 'request/LOADING_COMPLETE'

export const loading = () => ({ type: LOADING, name })
export const loadingComplete = () => ({ type: LOADING_COMPLETE, name })
export const getLodingState = state => _.get(state, ['temp', 'request', 'loading'])

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
