/* eslint-disable @typescript-eslint/no-use-before-define */
import _ from 'lodash'
import {
  showErrors, emptyErrors, showPage, changeElement, showEnd, saveResults, hideQuestion, showQuestion,
  addPrevPage, setEmbeddedData,
} from './actions'
import { NEXT_PAGE } from './consts'
import {
  pageQuestions, pageQuestionsWithoutHidden, getNextPage, getNextElementId,
  getSkipLogicSelector, getDisplayLogicSelector, getElementIdByBlockId,
} from './selectors'
import ValidationProcessor from './commands/ValidationProcessor'
import ElementProcessor from './commands/ElementProcessor'
import SkipLogicProcessor, { END_OF_ASSESSMENT, END_OF_BLOCK, SPECIFIC_BLOCK } from './commands/SkipLogicProcessor'
import DisplayLogicProcessor from './commands/DisplayLogicProcessor'

const FlowMiddleware = ({ getState, dispatch }) => next => (action) => {
  if (action.type !== NEXT_PAGE) { return next(action) }
  const { preview } = getState()

  const processDisplayLogic = () => {
    const { preview } = getState()
    const displayLogic = getDisplayLogicSelector(preview)
    if (displayLogic) {
      const questions = pageQuestions(preview)
      if (!DisplayLogicProcessor.run(displayLogic, preview.questions, preview.results)) {
        dispatch(hideQuestion(questions[0].id))
        if (questions.length === 1) {
          nextPage()
        }
      } else if (questions[0].hidden) {
        dispatch(showQuestion(questions[0].id))
      }
    }
  }

  const nextPage = () => {
    const { preview } = getState()
    const page = getNextPage(preview)

    if (page) {
      dispatch(showPage(preview.currentPage + 1))
      processDisplayLogic()
    } else {
      processNextElement()
    }
  }

  const processNextElement = () => {
    const { element, embeddedData } = ElementProcessor.run(preview, getNextElementId(preview))
    if (_.size(embeddedData) > 0) {
      dispatch(setEmbeddedData(embeddedData))
    }
    if (element) {
      dispatch(changeElement(element))
      processDisplayLogic()
    } else {
      dispatch(showEnd())
    }
  }

  if (preview.currentElement === null) {
    processNextElement()
    return
  }

  if (action.testDisplayLogic) {
    processDisplayLogic()
    return
  }

  const questions = pageQuestionsWithoutHidden(preview)
  const errors = ValidationProcessor.run(questions, preview.results)

  if (_.size(errors) > 0) {
    dispatch(showErrors(errors))
    return
  }

  dispatch(emptyErrors())

  // save results to backend
  if (preview.type === 'pass_assessment') {
    dispatch(saveResults(preview))
  }

  if (preview.currentElement) {
    dispatch(addPrevPage({ element: preview.currentElement, page: preview.currentPage }))
  }

  const skipLogic = getSkipLogicSelector(preview)

  if (skipLogic) {
    const skipResult = SkipLogicProcessor.run(skipLogic, preview.questions, preview.results)
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
        const element = getElementIdByBlockId(preview, skipResult.blockId)
        dispatch(changeElement(element))
        processDisplayLogic()
        return
      }
    }
  }

  nextPage()
}

export default FlowMiddleware
