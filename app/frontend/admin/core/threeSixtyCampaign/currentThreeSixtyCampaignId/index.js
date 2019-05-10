import _ from 'lodash'

export const get = state => _.get(state, ['threeSixtyCampaign', 'id'])

const defaultState = null
export default function reducer (state = defaultState) {
  return state
}
