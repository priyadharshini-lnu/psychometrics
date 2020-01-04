import AppStore from 'store/AppStore'
import { normalize } from 'normalizr'
import { NEXT_PAGE } from './actions'

const FlowMiddleware = ({ state, dispatch }) => next => (action) => {
  if (action.type !== NEXT_PAGE) { return next(action) }

  // run validation processor and dispatch show page and question errors

  // save current page and results in pages

  // run skip logic processor and dispatch skipping to logic(end of block, specific block, end of assessment)
  // NOTE: skip to specific block works only for linear flow

  // check if there is one more page and dispatch increment current page
  // else
  // run next flow element processor (should return action type and payload) for example {type: SHOW_BLOCK, blockId, page: 0}

  // run display logic processor for next page and dispatch increment current page or next flow element if there are not extra pages

  // check if there are no more blocks and pages and dispatch show end of assessment

}

export default FlowMiddleware
