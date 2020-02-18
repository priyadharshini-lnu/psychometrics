import _ from 'lodash'
import { createReducer } from 'utils/reduxUtils'
import { normalize } from 'normalizr'
import { setIn } from 'utils/immutable'
import InitPages from './commands/InitPages'
import NormalizeTree from './commands/NormalizeTree'
import InitLinearElements from './commands/InitLinearElements'
import { DefaultState } from './interfaces'
import { assessment } from '../../../store/schema'
import {
  INIT, ANSWER, SHOW_ERRORS, EMPTY_ERRORS, SHOW_PAGE,
  CHANGE_ELEMENT, SHOW_END, SET_EMBEDDED_DATA, HIDE_QUESTION,
  ADD_PREV_PAGE, REMOVE_PREV_PAGE, SET_DIRTY_RESULTS, SHOW_QUESTION,
} from './consts'

const defaultState: DefaultState = {
  initialized: false,
  isThreesixty: false,
  type: 'preview',
  enableBack: false,
  enableProgress: false,
  linear: false,
  elements: [],
  blocks: {},
  questions: {},
  embeddedData: {},
  normalizedTree: {},
  allPages: {}, // {[blockId]: [{questions: [1,2,3], blockId}]}
  results: {},
  prevPages: [], // [{element, page}, {element, page} ...]
  currentElement: null,
  currentPage: 0,
  errors: null,
  end: false,
}

const HANDLERS = {
  [INIT]: (state, { data, result }) => {
    const normalizedData = normalize({ blocks: data.blocks }, assessment)
    let { elements } = data.flow
    if (elements.length === 0) {
      elements = InitLinearElements.run(normalizedData.entities.blocks)
    }

    const normalizedTree = NormalizeTree.run(elements)

    // saga triggers next_page to process element '0'

    return {
      ...defaultState,
      type: data.type,
      isThreesixty: data.isThreesixty,
      resultsUrl: data.resultsUrl,
      enableBack: data.enable_back,
      enableProgress: false, // disabled for refactoring data.enable_progress,
      allPages: InitPages.run(data),
      normalizedTree,
      normRules: data.norm_rules,
      hrisData: result.hris || {},
      elements: data.flow.elements,
      linear: data.flow.elements.length === 0,
      blocks: normalizedData.entities.blocks,
      questions: normalizedData.entities.questions,
      currentElement: result.currentElement || null,
      currentPage: result.currentPage || 0,
      randomseed: result.id || '', // use assign or user id
      initialized: true,
      dbResult: result,
      results: result.results || {},
    }
  },
  [ANSWER]: (state, { result }) => setIn(state, ['results', result.question_id], result),
  [SHOW_ERRORS]: (state, { errors }) => setIn(state, ['errors'], errors),
  [EMPTY_ERRORS]: state => setIn(state, ['errors'], null),
  [CHANGE_ELEMENT]: (state, { id, page }) => ({ ...state, currentPage: page || 0, currentElement: id }),
  [SHOW_PAGE]: (state, { page }) => ({ ...state, currentPage: page }),
  [ADD_PREV_PAGE]: (state, { page }) => ({ ...state, prevPages: [...state.prevPages, page] }),
  [REMOVE_PREV_PAGE]: state => setIn(state, 'prevPages', _.slice(state.prevPages, 0, -1)),
  [SHOW_END]: state => ({ ...state, end: true }),
  [SET_EMBEDDED_DATA]: (state, { data }) => setIn(state, 'embeddedData', { ...state.embeddedData, ...data }),
  [HIDE_QUESTION]: (state, { id }) => setIn(state, ['questions', id, 'hidden'], true),
  [SHOW_QUESTION]: (state, { id }) => setIn(state, ['questions', id, 'hidden'], false),
  [SET_DIRTY_RESULTS]: (state, { questionIds: ids }) => {
    const results = ids.reduce((results, id) => ({ ...results, [id]: { ...state.results[id], dirty: true } }), {})
    return {
      ...state,
      results: { ...state.results, ...results },
    }
  },
}

export default createReducer(HANDLERS, defaultState)
