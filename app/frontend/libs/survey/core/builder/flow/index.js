import { createReducer } from 'utils/reduxUtils'
import HANDLERS from './handlers'

export const defaultState = {
  elements: [],
}

export default createReducer(HANDLERS, defaultState)
