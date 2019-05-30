import _ from 'lodash'

const FETCH_RELATIONSHIPS = 'threeSixty/relationships/FETCH_RELATIONSHIPS'

export const defaultState = []

export const getRelationships = state => _.get(state, ['project', 'relationships'])

export const fetchRelationships = campaignId => ({
  type: FETCH_RELATIONSHIPS,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/relationships`,
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_RELATIONSHIPS:
      return action.response
    default:
      return state
  }
}
