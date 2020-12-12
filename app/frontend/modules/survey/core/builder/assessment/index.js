import { DEPRECATED_createReducer } from 'utils/redux'
import { updateIn, setIn } from 'utils/immutable'
import Rule from 'models/Rule'
import {
  INIT, SELECT_QUESTION, UNSELECT_QUESTION,
  ENABLE, DISABLE, EMPTY_TRASH, MOVE_BLOCK_DOWN, MOVE_BLOCK_UP,
  ADD_NORM_RULE, REMOVE_NORM_RULE, UPDATE_FLOW,
  TOGGLE_ENABLE_BACK, TOGGLE_ENABLE_PROGRESS, SAVE,
  SAVE_REQUEST, SAVE_FAILURE, UPDATE_EXTRA, SAVE_DATA_SHEET,
} from './actions'
import {
  CREATE, CLONE_BLOCK, REMOVE, RESTORE_BLOCK,
} from './block/actions'
import { blocksWithoutDeleted } from './selectors'

export const defaultState = {
  loaded: false,
  disabled: false,
  saving: false,
  id: null,
  name: '',
  blocks: [],
  category: '',
  flow: null,
  relationships: [],
  norm_rules: [],
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
      // fix wrong norms initializing app/models/assessments/common.rb:23
      norm_rules: _.isEmpty(assessment.norm_rules) ? [] : assessment.norm_rules.map(r => new Rule(r)),
      propPanel: {
        question: null,
        offset: null,
      },
      loaded: true,
    })
  },
  [CREATE]: (state, { block }) => {
    const newState = _.cloneDeep(state)
    if (block.position) {
      newState.blocks.splice(block.position, 0, block.id)
    } else {
      newState.blocks = newState.blocks.concat(block.id)
    }
    return newState
  },
  [REMOVE]: (state, { block }) => {
    const blocks = _.clone(state.blocks)
    _.pull(blocks, block.id)
    return setIn(state, ['blocks'], blocks)
  },
  [CLONE_BLOCK]: (state, { block }) => {
    const newState = _.cloneDeep(state)
    newState.blocks.splice(block.position, 0, block.id)
    return newState
  },
  [RESTORE_BLOCK]: (state, { block }) => {
    const newState = _.cloneDeep(state)
    newState.blocks.splice(block.position - 1, 0, block.id)
    return newState
  },
  [SELECT_QUESTION]: (state, { question, offset }) => setIn(state, ['propPanel'], { question: question.id, offset }),
  [UNSELECT_QUESTION]: state => setIn(state, ['propPanel'], { question: null, offset: null }),
  [ENABLE]: state => ({ ...state, disabled: false }),
  [DISABLE]: state => ({ ...state, disabled: true }),
  [EMPTY_TRASH]: state => ({ ...state, trash: _.clone(state.trash).map((t) => { t.permanentRemove = true }) }),
  [MOVE_BLOCK_DOWN]: (state, { block }) => {
    const newState = _.cloneDeep(state)
    const index = _.findIndex(state.blocks, id => id === block.id)

    if (index < state.blocks.length - 1) {
      _.pull(newState.blocks, block.id)
      newState.blocks.splice(index + 1, 0, block.id)
      return newState
    }
    return state
  },
  [MOVE_BLOCK_UP]: (state, { block }) => {
    const newState = _.cloneDeep(state)
    const index = _.findIndex(state.blocks, id => id === block.id)

    if (index > 0) {
      _.pull(newState.blocks, block.id)
      newState.blocks.splice(index - 1, 0, block.id)
      return newState
    }
    return state
  },
  [ADD_NORM_RULE]: (state, { rule }) => (updateIn(state, ['norm_rules'], list => list.concat(rule))),
  [REMOVE_NORM_RULE]: (state, { index }) => {
    const rules = state.norm_rules.filter((_r, i) => index !== i)
    return setIn(state, ['norm_rules'], rules)
  },
  [UPDATE_FLOW]: (state, { flow }) => ({ ...state, flow }),
  [TOGGLE_ENABLE_BACK]: state => setIn(state, ['enable_back'], !state.enable_back),
  [TOGGLE_ENABLE_PROGRESS]: state => setIn(state, ['enable_progress'], !state.enable_progress),
  [SAVE_REQUEST]: state => setIn(state, ['saving'], true),
  [SAVE_FAILURE]: state => setIn(state, ['saving'], false),
  [SAVE]: state => setIn(state, ['saving'], false),
  [UPDATE_EXTRA]: (state, { extra }) => ({ ...state, extra }),
  [SAVE_DATA_SHEET]: (state, { data }) => setIn(state, ['data_sheet_columns'], data),
}

export default DEPRECATED_createReducer(HANDLERS, defaultState)
