import { updateIn } from 'utils/immutable'
import _ from 'lodash'
import { createReducer } from 'utils/redux'

export const ADD = 'threeSixty/nominationRequirement/conditions/ADD'
export const UPDATE = 'threeSixty/nominationRequirement/conditions/UPDATE'
export const REMOVE = 'threeSixty/nominationRequirement/conditions/REMOVE'

export const add = (relationshipId: number) => ({
  type: ADD,
  payload: { relationshipId },
})

export const remove = (index: number) => ({
  type: REMOVE,
  payload: { index },
})

export const update = (index: number, field: string, value: string) => ({
  type: UPDATE,
  payload: { index, field, value },
})

type AddType = ReturnType<typeof add>
type RemoveType = ReturnType<typeof remove>
type UpdateType = ReturnType<typeof update>

const HANDLERS = {
  [ADD]: (state, { payload }: AddType) => (
    state.concat([{ comparator: 'atleast', relationshipId: payload.relationshipId }])
  ),
  [REMOVE]: (state, { payload: { index } }: RemoveType) => (
    _.filter(state, (_, i: number) => index !== i)
  ),
  [UPDATE]: (state, { payload: { index, field, value } }: UpdateType) => (
    updateIn(state, index, condition => ({ ...condition, [field]: value }))
  ),
}

const defaultState = []

export default createReducer(HANDLERS, defaultState)
