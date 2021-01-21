import { createReducer } from 'utils/redux'

export const defaultState = {
  availableLocales: [],
}


const HANDLERS = {}

export default createReducer(HANDLERS, defaultState)
