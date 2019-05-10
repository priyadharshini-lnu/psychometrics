import _ from 'lodash'

export const get = state => _.get(state, ['project', 'datasheetFields'])

const defaultState = []
export default function reducer (state = defaultState) {
  return state
}
