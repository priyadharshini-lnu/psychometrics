import _ from 'lodash'
import {
  showErrors, emptyErrors, showPage, changeElement, showEnd, hideQuestion, showQuestion,
  addPrevPage, setEmbeddedData, nextButtonPressed, showSubmitPage,
  setDirtyResults,
} from './actions'
import { NEXT_PAGE } from './consts'
import {
  pageQuestions, pageQuestionsWithoutHidden, getNextPage, getNextElementId,
  getSkipLogicSelector, getDisplayLogicSelector, getElementIdByBlockId, getAllAnsweredQuestions,
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
      if (!DisplayLogicProcessor.run(displayLogic, preview)) {
        dispatch(hideQuestion(questions[0].id))
        dispatch(setDirtyResults([questions[0].id]))
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

  const needShowSubmitPage = () => {
    const state = getState()
    const { preview } = state

    const {
      showSubmitPage, enableBack, isThreesixty, showScoringOnEndPage,
    } = preview

    if (showSubmitPage) { return false }

    const canNotEdit = _.get(
      state, ['campaigns', 'campaign', 'options', 'participants', 'global', 'canNotEditEvaluation'],
    )
    if (enableBack && !showScoringOnEndPage && (!isThreesixty || (isThreesixty && canNotEdit))) {
      return true
    }
    if (showScoringOnEndPage && !_.isEmpty(preview.scoring)) {
      return true
    }
    return false
  }

  const processNextElement = () => {
    const { preview } = getState()
    const {
      element,
      embeddedData,
      endOfAssessmentElementProps,
    } = ElementProcessor.run(preview, getNextElementId(preview))
    if (_.size(embeddedData) > 0) {
      dispatch(setEmbeddedData(embeddedData))
    }
    if (element) {
      dispatch(changeElement(element))
      processDisplayLogic()
    } else if (needShowSubmitPage()) {
      dispatch(showSubmitPage())
    } else {
      dispatch(showEnd(endOfAssessmentElementProps))
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

  if (!action.skipValidations && !preview.ignoreValidations) {
    const answeredQuestions = getAllAnsweredQuestions(preview)
    const errors = ValidationProcessor.run(questions, preview.results, preview.mediaResponses, answeredQuestions)

    if (_.size(errors) > 0) {
      dispatch(showErrors(errors))
      return
    }
  }

  dispatch(emptyErrors())

  if (preview.currentElement && !action.ignoreBackBtn) {
    const questionIds = questions.map(q => q.id)
    if (!_.find(preview.prevPages, { element: preview.currentElement, page: preview.currentPage })) {
      dispatch(addPrevPage({ element: preview.currentElement, page: preview.currentPage, questionIds }))
    }
  }

  const skipLogic = getSkipLogicSelector(preview)

  if (skipLogic) {
    const skipResult = SkipLogicProcessor.run(skipLogic, preview.questions, preview.results)
    if (skipResult) {
      if (skipResult.type === END_OF_ASSESSMENT) {
        if (needShowSubmitPage()) {
          dispatch(showSubmitPage())
        } else {
          dispatch(showEnd())
        }
        return
      }
      if (skipResult.type === END_OF_BLOCK) {
        processNextElement()
        return
      }
      if (skipResult.type === SPECIFIC_BLOCK && preview.linear) {
        const element = getElementIdByBlockId(preview, skipResult.blockId)
        if (element) {
          dispatch(changeElement(element))
          processDisplayLogic()
        }
        return
      }
    }
  }

  dispatch(nextButtonPressed())
  nextPage()
}

export default FlowMiddleware
