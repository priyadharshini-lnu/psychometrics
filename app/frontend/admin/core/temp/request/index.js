import _ from 'lodash'

export const LOADING = 'request/LOADING'
export const LOADING_COMPLETE = 'request/LOADING_COMPLETE'

export const loading = () => ({ type: LOADING, name })
export const loadingComplete = () => ({ type: LOADING_COMPLETE, name })
export const getLodingState = state => _.get(state, ['temp', 'request', 'loading'])

const defaultState = { loading: false }
export default function reducer (state = defaultState, { type }) {
  switch (type) {
    case LOADING:
      return { loading: true }
    case LOADING_COMPLETE:
      return { loading: false }
    default:
      return state
  }
}
