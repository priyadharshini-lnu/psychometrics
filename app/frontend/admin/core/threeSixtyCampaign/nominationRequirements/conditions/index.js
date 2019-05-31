import { updateIn } from 'utils/immutable'
import _ from 'lodash'

export const ADD_CONDITION = 'threeSixty/nominationRequirement/conditions/ADD'
export const UPDATE_CONDITION = 'threeSixty/nominationRequirement/conditions/UPDATE'
export const REMOVE_CONDITION = 'threeSixty/nominationRequirement/conditions/REMOVE'

export const add = relationshipId => ({
  type: ADD_CONDITION,
  payload: { relationshipId },
})

export const remove = index => ({
  type: REMOVE_CONDITION,
  payload: { index },
})

export const update = (index, field, value) => ({
  type: UPDATE_CONDITION,
  payload: { index, field, value },
})

const HANDLERS = {
  [ADD_CONDITION]: (state, { payload }) => (
    state.concat([{ comparator: 'atleast', relationshipId: payload.relationshipId }])
  ),
  [REMOVE_CONDITION]: (state, { payload: { index } }) => (
    _.filter(state, (_, i) => index !== i)
  ),
  [UPDATE_CONDITION]: (state, { payload: { index, field, value } }) => (
    updateIn(state, index, condition => ({ ...condition, [field]: value }))
  ),
}

const defaultState = []

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
