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

  // save current page (questions ids ???) to handle clearing results on back btn

  // run skip logic processor and dispatch skipping to logic(end of block, specific block, end of assessment)
  // dispatch CHANGE_ELEMENT, SHOW_PAGE
  // NOTE: skip to specific block works only for linear flow

  // get displayLogic to use bellow

  // check if there is one more page and dispatch increment current page
  // dispatch SHOW_PAGE
  // else
  // run next flow element processor (should return action type and payload)
  // for example {type: SHOW_BLOCK, blockId, page: 0}
  // dispatch CHANGE_ELEMENT, SHOW_PAGE

  // save results to backend

  // run display logic processor for next page
  // dispatch HIDE_QUESTOIN and show page
  // dispatch next page if there are not extra pages

  // check if there are no more pages and elements and
  // dispatch show end
}

export default FlowMiddleware
