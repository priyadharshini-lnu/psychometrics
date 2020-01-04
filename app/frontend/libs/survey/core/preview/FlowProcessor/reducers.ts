import { createReducer } from 'utils/reduxUtils'
import { initPages } from './helpers'
import { assessment } from 'store/schema'
import { normalize } from 'normalizr'
import {INIT, NEXT_PAGE, ANSWER} from './actions'
import { getIn, setIn, updateIn } from 'utils/immutable'

const defaultState = {
  elements: [],
  blocks: {},
  questions: {},
  questionsQueue: [],
  pages: [],  // {questions: [1,2,3], errors: []}
  allPages: {}, // {[block_id]: [{ ...page }]}
  results: {},
  currentBlock: null,
  currentPage: 0,
  errors: {}, //{[question_id]: [errors]}
  end: false,
}

const HANDLERS = {
  [INIT]: (state, {data}:any) => {
    console.log(data)
    const normalizedData = normalize({blocks: data.blocks}, assessment)

    // init block elements for linear flow
    // add saga to run first element processor

    console.log(normalizedData)
    return {
      ...state,
      allPages: initPages(data),
      elements: data.flow.elements,
      linear: data.flow.elements.length === 0,
      blocks: normalizedData.entities.blocks,
      questions: normalizedData.entities.questions,
      currentBlock: data.blocks[0] &&  data.blocks[0].id, //should gone after implement saga
    }
  },
  [ANSWER]: (state, {result}) => {
    return setIn(state, ['results', result.question_id], result)
  }
}

export default createReducer(HANDLERS, defaultState)
