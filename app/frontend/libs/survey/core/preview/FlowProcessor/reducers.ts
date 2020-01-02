import { createReducer } from 'utils/reduxUtils'

const INIT = 'flow_processor/INIT'
const NEXT_PAGE = 'flow_processor/NEXT_PAGE'
const PREV_PAGE = 'flow_processor/PREV_PAGE'


const defaultState = {
  elements: [],
  blocks: {},
  questions: {},
  questionsQueue: [],
  pages: [],  // {questions: [1,2,3], errors: []}
  results: [],
  currentPage: 0,
}

const HANDLERS = {
  [INIT]: (state, {data}) => {
    console.log(data)
    return {
      ...state,
      elements: data.flow.elements,
    }
  }
}

export default createReducer(HANDLERS, defaultState)
