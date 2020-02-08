import _ from 'lodash'
import {
  NEXT_PAGE, showErrors, emptyErrors, showPage, changeElement, showEnd, saveResults, hideQuestion,
} from './actions'
import {
  pageQuestions, pageQuestionsWithoutHidden, nextPageSelector, nextElementIdSelector,
  skipLogicSelector, displayLogicSelector, selectElementIdByBlockId,
} from './selectors'
import ValidationProcessor from './ValidationProcessor'
import ElementProcessor from './ElementProcessor'
import SkipLogicProcessor, {END_OF_ASSESSMENT, END_OF_BLOCK, SPECIFIC_BLOCK} from './SkipLogicProcessor'
import DisplayLogicProcessor from './DisplayLogicProcessor'


const FlowMiddleware = ({ getState, dispatch }) => next => (action) => {
  if (action.type !== NEXT_PAGE) { return next(action) }
  const { preview } = getState()

  const questions = pageQuestionsWithoutHidden(preview)
  const errors = ValidationProcessor(questions, preview.results)

  if (_.size(errors) > 0) {
    dispatch(showErrors(errors))
    return
  } else {
    dispatch(emptyErrors())
  }

  // save results to backend
  if (preview.type === 'pass_assessment') {
    dispatch(saveResults(preview))
  }

  const processDisplayLogic = () => {
    const { preview } = getState()
    const displayLogic = displayLogicSelector(preview)
    if (displayLogic) {
      if (!DisplayLogicProcessor(displayLogic, preview.questions, preview.results)) {
        const questions = pageQuestions(preview)
        dispatch(hideQuestion(questions[0].id))
        if (questions.length === 1) {
          nextPage()
        }
      }
    }
  }

  const nextPage = () => {
    const { preview } = getState()
    const page = nextPageSelector(preview)

    if (page) {
      dispatch(showPage(preview.currentPage + 1))
      processDisplayLogic()
    } else {
      processNextElement()
    }
  }

  const processNextElement = () => {
    const result = ElementProcessor(preview, nextElementIdSelector(preview), dispatch)
    if (result) {
      dispatch(changeElement(result.element))
      processDisplayLogic()
    } else {
      dispatch(showEnd())
    }
  }

  const skipLogic = skipLogicSelector(preview)

  // process skip logic
  // run skip logic processor and dispatch skipping to logic(end of block, specific block, end of assessment)
  // dispatch CHANGE_ELEMENT
  // NOTE: skip to specific block works only for linear flow

  if (skipLogic) {
    const skipResult = SkipLogicProcessor(skipLogic, preview.questions, preview.results)
    if (skipResult) {
      if (skipResult.type === END_OF_ASSESSMENT) {
        dispatch(showEnd())
        return
      }
      if (skipResult.type === END_OF_BLOCK) {
        processNextElement()
        return
      }
      if (skipResult.type === SPECIFIC_BLOCK && preview.linear) {
        const element = selectElementIdByBlockId(preview, skipResult.blockId)
        dispatch(changeElement(element))
        processDisplayLogic()
        return
      }
    }
  }

  // get displayLogic to use bellow

  // show next page
  // check if there is one more page and dispatch increment current page
  // dispatch SHOW_PAGE
  // else
  // run next flow element processor (should return action type and payload)
  // for example {type: SHOW_BLOCK, blockId, page: 0}
  // dispatch CHANGE_ELEMENT

  nextPage()
}

export default FlowMiddleware
