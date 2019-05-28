export const ADD_CONDITION = 'threeSixty/nominationRequirement/ADD_CONDITION'
export const UPDATE_CONDITION = 'threeSixty/nominationRequirement/UPDATE_CONDITION'
export const REMOVE_CONDITION = 'threeSixty/nominationRequirement/REMOVE_CONDITION'


const HANDLERS = {
  [ADD_CONDITION]: (state, { payload: { key, value } }) => (
    updateIn(state, key, conditions => (
      conditions.concat([{ operator: 'atleast' }]))
    )
  ),
  [REMOVE_CONDITION]: (state, { payload: { key, index } }) => (
    updateIn(state, key, conditions => _.filter(conditions, (_, i) => index !== i))
  ),
  [UPDATE_CONDITION]: (state, { payload: { index, name, value, } }) => (
    updateIn(state, index, condition => ({ ...condition, [name]: value }))
  ),
}

const defaultState = []

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
