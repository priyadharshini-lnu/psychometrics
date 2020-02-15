import { createReducer } from 'utils/reduxUtils'
import { normalize } from 'normalizr'
import { setIn } from 'utils/immutable'
import { initPages, initLinearElements, normalizeTree } from './helpers'
import { assessment } from '../../../store/schema'
import {
  INIT, ANSWER, SHOW_ERRORS, EMPTY_ERRORS, SHOW_PAGE,
  CHANGE_ELEMENT, SHOW_END, SET_EMBEDED_DATA, HIDE_QUESTION,
} from './actions'

const defaultState = {
  initialized: false,
  type: 'preview',
  enableBack: false,
  enableProgress: false,
  elements: [],
  blocks: {},
  questions: {},
  questionsQueue: [],
  embeddedData: {},
  pages: [], // {questions: [1,2,3], elementRef}
  allPages: {},
  results: {},
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
      elements = initLinearElements(normalizedData.entities.blocks)
    }

    const normalizedTree = normalizeTree(elements)

    // saga triggers next_page to process element '0'

    return {
      ...defaultState,
      enableBack: data.enable_back,
      enableProgress: data.enable_progress,
      allPages: initPages(data),
      normalizedTree,
      elements: data.flow.elements,
      linear: data.flow.elements.length === 0,
      blocks: normalizedData.entities.blocks,
      questions: normalizedData.entities.questions,
      currentElement: result.currentElement || null,
      currentPage: result.currentPage || 0,
      randomseed: result.id || '', // use assign or user id
      initialized: true,
      results: result.results || {},
    }
  },
  [ANSWER]: (state, { result }) => setIn(state, ['results', result.question_id], result),
  [SHOW_ERRORS]: (state, { errors }) => setIn(state, ['errors'], errors),
  [EMPTY_ERRORS]: state => setIn(state, ['errors'], null),
  [CHANGE_ELEMENT]: (state, { id }) => ({ ...state, currentPage: 0, currentElement: id }),
  [SHOW_PAGE]: (state, { page }) => setIn(state, ['currentPage'], page),
  [SHOW_END]: state => ({ ...state, end: true }),
  [SET_EMBEDED_DATA]: (state, { data }) => setIn(state, 'embeddedData', Object.assign({}, state.embeddedData, data)),
  [HIDE_QUESTION]: (state, { id }) => setIn(state, ['questions', id, 'hidden'], true),
}

export default createReducer(HANDLERS, defaultState)
