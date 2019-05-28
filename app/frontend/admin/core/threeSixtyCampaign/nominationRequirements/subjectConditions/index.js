export const ADD_SUBJECT_CONDITION = 'threeSixty/nominationRequirement/ADD_SUBJECT_CONDITION'
export const UPDATE_SUBJECT_CONDITION = 'threeSixty/nominationRequirement/UPDATE_SUBJECT_CONDITION'
export const REMOVE_SUBJECT_CONDITION = 'threeSixty/nominationRequirement/REMOVE_SUBJECT_CONDITION'

const HANDLERS = {
  [ADD_SUBJECT_CONDITION]: (state, { payload: { key, value, logicalOperator } }) => (
    updateIn(state, key, conditions => (
      conditions.concat([{ field: value, operator: 'equal', logicalOperator: logicalOperator || 'and' }]))
    )
  ),
  [REMOVE_SUBJECT_CONDITION]: (state, { payload: { key, index } }) => (
    updateIn(state, key, conditions => _.filter(conditions, (_, i) => index !== i))
  ),
  [UPDATE_SUBJECT_CONDITION]: (state, { payload: { index, name, value, } }) => (
    updateIn(state, index, condition => ({ ...condition, [name]: value }))
  ),
}

const defaultState = []

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
