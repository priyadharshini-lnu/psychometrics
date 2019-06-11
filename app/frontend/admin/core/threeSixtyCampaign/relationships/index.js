import _ from 'lodash'
import { createSelector } from 'reselect'
import { ASSIGN_TYPES } from 'constants/relationship'

const FETCH_RELATIONSHIPS = 'threeSixty/relationships/FETCH_RELATIONSHIPS'

export const defaultState = []

export const getRelationships = state => _.get(state, ['project', 'relationships'], [])
export const getDefaultRelationshipId = state => _.get(getRelationships(state), [0, 'id'])

export const getManualRelationships = createSelector(
  getRelationships,
  relationships => relationships.filter(r => r.assignType === ASSIGN_TYPES.MANUAL),
)

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
