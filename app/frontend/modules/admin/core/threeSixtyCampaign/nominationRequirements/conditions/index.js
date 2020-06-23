import { updateIn } from 'utils/immutable'
import _ from 'lodash'

export const ADD = 'threeSixty/nominationRequirement/conditions/ADD'
export const UPDATE = 'threeSixty/nominationRequirement/conditions/UPDATE'
export const REMOVE = 'threeSixty/nominationRequirement/conditions/REMOVE'

export const add = relationshipId => ({
  type: ADD,
  payload: { relationshipId },
})

export const remove = index => ({
  type: REMOVE,
  payload: { index },
})

export const update = (index, field, value) => ({
  type: UPDATE,
  payload: { index, field, value },
})

const HANDLERS = {
  [ADD]: (state, { payload }) => (
    state.concat([{ comparator: 'atleast', relationshipId: payload.relationshipId }])
  ),
  [REMOVE]: (state, { payload: { index } }) => (
    _.filter(state, (_, i) => index !== i)
  ),
  [UPDATE]: (state, { payload: { index, field, value } }) => (
    updateIn(state, index, condition => ({ ...condition, [field]: value }))
  ),
}

const defaultState = []

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
