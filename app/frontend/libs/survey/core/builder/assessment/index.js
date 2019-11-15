import { createReducer } from 'utils/reduxUtils'
import HANDLERS from './handlers'

export const defaultState = {
  loaded: false,
  id: null,
  name: '',
  blocks: [],
  category: '',
  flow: null,
  relationships: [],
  factors: [],
  propPanel: {
    question: null,
    offset: null,
  },
}

export default createReducer(HANDLERS, defaultState)
