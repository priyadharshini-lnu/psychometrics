import _ from 'lodash'
import { NEXT_PAGE, showErrors, emptyErrors } from './actions'
import {currentPage, pageQuestions} from './selectors'
import ValidationProcessor from './ValidationProcessor'

const FlowMiddleware = ({ getState, dispatch }) => next => (action) => {
  if (action.type !== NEXT_PAGE) { return next(action) }
  const { preview } = getState()

  // run validation processor and dispatch show errors
  const questions = pageQuestions(preview)
  console.log(preview.results)
  const errors = ValidationProcessor(questions, preview.results)

  if (_.size(errors) > 0) {
    dispatch(showErrors(errors))
    return
  } else {
    dispatch(emptyErrors())
  }


  // save current page and results in pages

  // run skip logic processor and dispatch skipping to logic(end of block, specific block, end of assessment)
  // NOTE: skip to specific block works only for linear flow

  // check if there is one more page and dispatch increment current page
  // else
  // run next flow element processor (should return action type and payload) for example {type: SHOW_BLOCK, blockId, page: 0}

  // run display logic processor for next page and dispatch increment current page or next flow element if there are not extra pages

  // save results to backend

  // check if there are no more blocks and pages and dispatch show end of assessment

}

export default FlowMiddleware
