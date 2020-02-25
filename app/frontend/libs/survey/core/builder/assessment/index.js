import { createReducer } from 'utils/reduxUtils'
import { updateIn, setIn } from 'utils/immutable'
import {
  INIT, SELECT_QUESTION, UNSELECT_QUESTION, FAKE_UPDATE,
  ENABLE, DISABLE, EMPTY_TRASH, MOVE_BLOCK_DOWN, MOVE_BLOCK_UP,
  ADD_NORM_RULE, REMOVE_NORM_RULE,
} from './actions'
import {
  CREATE, CLONE_BLOCK, REMOVE, RESTORE_BLOCK,
} from './block/actions'
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
      norm_rules: _.isEmpty(assessment.norm_rules) ? [] : assessment.norm_rules,
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
  [REMOVE_NORM_RULE]: (state, { rule }) => {
    const rules = _.clone(state.norm_rules)
    _.remove(rules, rule)
    return setIn(state, ['norm_rules'], rules)
  },
  [FAKE_UPDATE]: state => ({ ...state, timestamp: new Date() }),

}

export default createReducer(HANDLERS, defaultState)
