import _ from 'lodash'

export const get = state => _.get(state, ['config'])

export const defaultState = {
  isFrame: false,
}

export default function reducer (state = defaultState) {
  return state
}
