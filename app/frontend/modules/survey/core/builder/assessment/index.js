import _ from 'lodash'
import { createReducer } from '~/utils/redux'
import { updateIn, setIn } from '~/utils/immutable'
import Rule from '~/modules/survey/models/Rule'
import {
  INIT, SELECT_QUESTION, UNSELECT_QUESTION,
  ENABLE, DISABLE, EMPTY_TRASH, MOVE_BLOCK_DOWN, MOVE_BLOCK_UP,
  ADD_NORM_RULE, REMOVE_NORM_RULE, UPDATE_FLOW,
  TOGGLE_ENABLE_BACK, TOGGLE_ENABLE_PROGRESS, SAVE,
  SAVE_REQUEST, SAVE_FAILURE, UPDATE_EXTRA, SAVE_DATA_SHEET,
  TOGGLE_ENABLE_SINGLE_QUESTION, CHANGE_DEFAULT_NORM,
  TOGGLE_INSTRUCTIONS, UPDATE_INSTRUCTIONS_CONTENT,
  UPDATE_LINKED_QUESTIONS,
  TOGGLE_ENABLE_SAVE,
  SAVE_CAMPAIGN_FACTORS,
} from './actions'
import {
  CREATE, CLONE_BLOCK, REMOVE, RESTORE_BLOCK,
} from './block/actions'
import { blocksWithoutDeleted } from './selectors'

export const defaultState = {
  loaded: false,
  disabled: false,
  disableReason: null,
  disableMessage: null,
  saving: false,
  id: null,
  name: '',
  blocks: [],
  category: '',
  flow: null,
  relationships: [],
  norm_rules: [],
  default_norm_id: null,
  factors: [],
  propPanel: {
    question: null,
    offset: null,
  },
  trash: [],
  options: {},
  instructions: {},
  ownerId: null,
  linkedAssessment: null,
  linkedQuestions: {},
  defaultLanguage: null,
}

const HANDLERS = {
  [INIT]: (state, { data }) => {
    const ids = data.entities.assessment[data.result].blocks
    const assessment = data.entities.assessment[data.result]
    assessment.blocks = blocksWithoutDeleted(data.entities, ids).map(b => b.id)

    return ({
      ...state,
      ...assessment,
      ownerId: assessment.owner_id,
      instructions: assessment.instructions || {},
      // fix wrong norms initializing app/models/assessments/common.rb:23
      norm_rules: _.isEmpty(assessment.norm_rules) ? [] : assessment.norm_rules.map(r => new Rule(r)),
      propPanel: {
        question: null,
        offset: null,
      },
      linkedAssessment: assessment.linked_assessment,
      linkedQuestions: assessment.linked_questions || {},
      loaded: true,
      defaultLanguage: assessment.default_language,
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
  [ENABLE]: state => ({
    ...state,
    disabled: false,
    disableReason: null,
    disableMessage: null,
  }),
  [DISABLE]: (state, { payload = {} }) => ({
    ...state,
    disabled: true,
    disableReason: payload.reason || 'unknown',
    disableMessage: payload.message || null,
  }),
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
  [CHANGE_DEFAULT_NORM]: (state, { id }) => (setIn(state, ['default_norm_id'], id)),
  [UPDATE_FLOW]: (state, { flow }) => ({ ...state, flow }),
  [TOGGLE_ENABLE_BACK]: state => setIn(state, ['enable_back'], !state.enable_back),
  [TOGGLE_ENABLE_SAVE]: state => setIn(
    state, ['options', 'enable_save'], !state.options.enable_save,
  ),
  [TOGGLE_ENABLE_PROGRESS]: state => setIn(state, ['enable_progress'], !state.enable_progress),
  [TOGGLE_ENABLE_SINGLE_QUESTION]: state => setIn(
    state, ['options', 'enable_single_question_page'], !state.options.enable_single_question_page,
  ),
  [SAVE_REQUEST]: state => setIn(state, ['saving'], true),
  [SAVE_FAILURE]: state => setIn(state, ['saving'], false),
  [SAVE]: state => setIn(state, ['saving'], false),
  [UPDATE_EXTRA]: (state, { extra }) => ({ ...state, extra }),
  [SAVE_DATA_SHEET]: (state, { data }) => setIn(state, ['data_sheet_columns'], data),
  [TOGGLE_INSTRUCTIONS]: state => setIn(
    state, ['instructions', 'enabled'], !_.get(state, ['instructions', 'enabled']),
  ),
  [UPDATE_INSTRUCTIONS_CONTENT]: (state, { content }) => setIn(
    state, ['instructions', 'content'], content,
  ),
  [UPDATE_LINKED_QUESTIONS]: (state, { id, questions }) => setIn(
    state, ['linkedQuestions', id], questions,
  ),
  [SAVE_CAMPAIGN_FACTORS]: (state, { data }) => setIn(
    state, ['campaign_factors_list'], data,
  ),
}

export default createReducer(HANDLERS, defaultState)
