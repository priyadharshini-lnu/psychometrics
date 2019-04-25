export const VALIDATION_ERROR = 'temp/errors/VALIDATION_ERROR'
export const defaultState = null

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case VALIDATION_ERROR:
      return action.errors
    default:
      return state
  }
}
