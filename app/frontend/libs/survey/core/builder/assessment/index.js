import { createReducer } from 'utils/reduxUtils'
import { setIn } from 'utils/immutable'
import { denormalize } from 'normalizr'
import schema from 'store/schema'
import {
  INIT, SELECT_QUESTION, UNSELECT_QUESTION, FAKE_UPDATE,
  ENABLE, DISABLE, EMPTY_TRASH,
} from './actions'
import { blocksWithoutDeleted } from './selectors'

export const defaultState = {
  loaded: false,
  disabled: false,
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
  trash: [],
}

const HANDLERS = {
  [INIT]: (state, { data }) => {
    const ids = data.entities.assessment[data.result].blocks
    const assessment = data.entities.assessment[data.result]
    assessment.blocks = blocksWithoutDeleted(data.entities, ids).map(b => b.id)

    return ({
      ...state,
      ...assessment,
      loaded: true,
    })
  },
  [SELECT_QUESTION]: (state, { question, offset }) => setIn(state, ['propPanel'], { question, offset }),
  [UNSELECT_QUESTION]: state => setIn(state, ['propPanel'], { question: null, offset: null }),
  [ENABLE]: state => ({ ...state, disabled: false }),
  [DISABLE]: state => ({ ...state, disabled: true }),
  [EMPTY_TRASH]: state => ({ ...state, trash: _.clone(state.trash).map((t) => { t.permanentRemove = true }) }),
  [FAKE_UPDATE]: state => ({ ...state, timestemp: new Date() }),
}

export default createReducer(HANDLERS, defaultState)
