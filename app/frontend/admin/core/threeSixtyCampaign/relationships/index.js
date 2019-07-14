import _ from 'lodash'
import { createSelector } from 'reselect'
import { ASSIGN_TYPES } from 'constants/relationship'

const FETCH_RELATIONSHIPS = 'threeSixty/relationships/FETCH_RELATIONSHIPS'
const FETCH_WITH_USAGE = 'threeSixty/relationships/FETCH_WITH_USAGE'
const CREATE = 'threeSixty/relationships/CREATE'
const UPDATE = 'threeSixty/relationships/UPDATE'
const UPDATE_REQUEST = 'threeSixty/relationships/UPDATE_REQUEST'
const REMOVE = 'threeSixty/relationships/REMOVE'

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

export const create = (campaignId, attrs) => ({
  type: CREATE,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/relationships`,
    body: attrs
  },
})

export const remove = (campaignId, relationshipId) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/relationships/${relationshipId}`
  },
})
export const update = (campaignId, relationshipId, attrs) => ({
  type: UPDATE,
  id: relationshipId,
  request: {
    method: 'put',
    debounce: 150,
    url: `/administration/threesixty_campaigns/${campaignId}/relationships/${relationshipId}`,
    body: attrs
  },
})

export const fetchWithUsage = campaignId => ({
  type: FETCH_WITH_USAGE,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/relationships/fetch_with_usage`,
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_RELATIONSHIPS:
      return action.response
    case FETCH_WITH_USAGE:
      return action.response
    case CREATE:
      return [...state, action.response]
    case REMOVE:
      return state.filter(r => r.id !== action.response)
    case UPDATE_REQUEST:
      return state.map((r) => {
        if (r.id !== action.id) return r
        return { ...r, ...action.request.body}
      })
    default:
      return state
  }
}
