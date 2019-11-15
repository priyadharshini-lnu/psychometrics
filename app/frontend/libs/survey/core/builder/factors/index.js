import { createReducer } from 'utils/reduxUtils'
import HANDLERS from './handlers'

export const defaultState = {
  current: null,
  factors: [],
}

export default createReducer(HANDLERS, defaultState)
