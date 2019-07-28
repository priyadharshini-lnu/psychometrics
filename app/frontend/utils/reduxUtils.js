const reduxUtils = {
  combineHandlers (handlers, defaultState) {
    return function reducer (state = defaultState, action) {
      const handler = handlers[action.type]
      return handler ? handler(state, action) : state
    }
  },
}

export default reduxUtils
