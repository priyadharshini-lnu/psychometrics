import { createReducer } from 'utils/reduxUtils'
import { initPages, initLinearElements, normalizeTree } from './helpers'
import { assessment } from '../../../store/schema'
import { normalize } from 'normalizr'
import {
  INIT, ANSWER, SHOW_ERRORS, EMPTY_ERRORS, SHOW_PAGE,
  CHANGE_ELEMENT,
} from './actions'
import { getIn, setIn, updateIn } from 'utils/immutable'

const defaultState = {
  initialized: false,
  elements: [],
  blocks: {},
  questions: {},
  questionsQueue: [],
  pages: [],  // {questions: [1,2,3], elementRef}
  allPages: {}, // {[block_id]: [{ ...page }, {end}]}
  results: {},
  currentPage: 0,
  errors: null, //{[question_id]: [errors]}
  end: false,
}

const HANDLERS = {
  [INIT]: (state, {data}) => {
    console.log(data)
    const normalizedData = normalize({blocks: data.blocks}, assessment)

    let elements = data.flow.elements
    if (elements.length === 0) {
      elements = initLinearElements(normalizedData.entities.blocks)
    }

    const normalizedTree = normalizeTree(elements)

    // init block elements for linear flow  [{block}...]
    // add saga to run first element processor

    console.log(normalizedData)

    return {
      ...state,
      allPages: initPages(data),
      normalizedTree,
      elements: data.flow.elements,
      linear: data.flow.elements.length === 0,
      blocks: normalizedData.entities.blocks,
      questions: normalizedData.entities.questions,
      currentElement: '0',
      initialized: true,
    }
  },
  [ANSWER]: (state, {result}) => setIn(state, ['results', result.question_id], result),
  [SHOW_ERRORS]: (state, {errors}) => setIn(state, ['errors'], errors),
  [EMPTY_ERRORS]: (state) => setIn(state, ['errors'], null),
  [CHANGE_ELEMENT]: (state, { id }) => setIn(state, ['currentElement'], id),
  [SHOW_PAGE]: (state, {page}) => setIn(state, ['currentPage'], page),
}

export default createReducer(HANDLERS, defaultState)
