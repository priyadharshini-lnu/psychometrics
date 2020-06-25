export const createReducer = (handlers, defaultState) => (state = defaultState, action) => {
  const handler = handlers[action.type]
  return handler ? handler(state, action) : state
}
