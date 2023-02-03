import _ from 'lodash'
import { createSelector } from 'reselect'
import { ASSIGN_TYPES } from '~/constants/relationship'
import { ApiActionResponse } from '~/interfaces/ApiActionResponse'
import { createReducer } from '~/utils/redux'

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

export const fetchRelationships = (campaignId: number) => ({
  type: FETCH_RELATIONSHIPS,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/relationships`,
  },
})

export const create = (campaignId: number, attrs: {campaignId: number}) => ({
  type: CREATE,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/relationships`,
    body: attrs,
  },
})

export const remove = (campaignId: number, relationshipId: number) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/relationships/${relationshipId}`,
  },
})

export const update = (campaignId: number, relationshipId: number, attrs: {name: string}) => ({
  type: UPDATE,
  id: relationshipId,
  request: {
    method: 'put',
    debounce: 300,
    url: `/administration/threesixty_campaigns/${campaignId}/relationships/${relationshipId}`,
    body: attrs,
  },
})

export const fetchWithUsage = (campaignId: number) => ({
  type: FETCH_WITH_USAGE,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/relationships/fetch_with_usage`,
  },
})

interface Relationship {
  id: number
  type: string
  name: string
}

export type FetchRelationshipsAction = ApiActionResponse<Relationship[]>
export type FetchWithUsageAction = ApiActionResponse<Relationship[]>
export type CreateAction = ApiActionResponse<Relationship>
export type RemoveAction = ApiActionResponse<Relationship>
export type UpdateRequestAction = ApiActionResponse<Relationship>

const HANDLERS = {
  [FETCH_RELATIONSHIPS]: (_, { response }: FetchRelationshipsAction) => (response),
  [FETCH_WITH_USAGE]: (_, { response }: FetchWithUsageAction) => (response),
  [CREATE]: (state, { response }: CreateAction) => [...state, response],
  [REMOVE]: (state, { response }: RemoveAction) => state.filter(r => r.id !== response),
  [UPDATE_REQUEST]: (state, action: UpdateRequestAction) => state.map((r) => {
    if (r.id !== action.id) return r
    return { ...r, ...action.request.body }
  }),
}

export default createReducer(HANDLERS, defaultState)
