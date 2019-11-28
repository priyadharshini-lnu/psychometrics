import { createReducer } from 'utils/reduxUtils'
import { setIn } from 'utils/immutable'
import {
  INIT, SELECT_QUESTION, UNSELECT_QUESTION, FAKE_UPDATE,
} from './actions'

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

const HANDLERS = {
  [INIT]: (state, { data }) => ({ ...state, ...data, loaded: true }),
  [SELECT_QUESTION]: (state, { question, offset }) => setIn(state, ['propPanel'], { question, offset }),
  [UNSELECT_QUESTION]: state => setIn(state, ['propPanel'], { question: null, offset: null }),
  [FAKE_UPDATE]: state => ({ ...state, timestemp: new Date() }),
}

export default createReducer(HANDLERS, defaultState)
