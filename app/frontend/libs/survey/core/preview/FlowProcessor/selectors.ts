import _ from 'lodash'
import { createSelector } from 'reselect'
import { denormalize } from 'normalizr'
import { question } from '../../../store/schema'
import NextElementId from './commands/NextElementId'
import NextParentElementId from './commands/NextParentElementId'
import { ElementInterface } from './interfaces'

export const getQuestions = (state, ids) => denormalize(ids, [question], state)

export const getQuestion = (state, id) => state.questions[id]
export const getErrors = state => state.errors
export const getResults = state => state.results

export const currentPage = state => state.currentPage

export const getElement = (state, id): ElementInterface => state.normalizedTree[id]
export const getCurrentElement = state => state.normalizedTree[state.currentElement]

export const getElementIdByBlockId = (state, blockId) => _.findKey(
  state.normalizedTree, el => el.props && el.props.current === `${blockId}`,
)

export const getCurrentPage = (state) => {
  const block = getCurrentElement(state).props.current
  const pages = state.allPages[block]
  return pages[state.currentPage]
}

export const getNextPage = (state) => {
  const block = getCurrentElement(state).props.current
  const pages = state.allPages[block]
  return pages[state.currentPage + 1]
}

export const getNextElementId = (state, element: string | null = null) => {
  let id: string | null = NextElementId.run(element || state.currentElement)
  if (state.normalizedTree[id]) {
    return id
  }

  // eslint-disable-next-line no-cond-assign
  while (id = NextParentElementId.run(id)) {
    if (state.normalizedTree[id]) {
      return id
    }
  }
  return null
}

export const getChildOrNextElementId = (state, element: string | null = null) => {
  const id = `${element || state.currentElement}/0`
  if (state.normalizedTree[id]) {
    return id
  }
  return getNextElementId(state, id)
}

export const pageQuestions = createSelector(
  state => state,
  getCurrentPage,
  (state, page) => getQuestions(state, page.questions),
)

export const pageQuestionsWithoutHidden = createSelector(pageQuestions, questions => questions.filter(q => !q.hidden))

export const getQuestionErrors = createSelector(
  getQuestion,
  getErrors,
  (question, errors) => (errors && errors[question.id]) || [],
)

export const pageErrors = state => state.errors

export const getSkipLogicSelector = createSelector(getCurrentPage, page => page.skipLogic)
export const getDisplayLogicSelector = createSelector(
  pageQuestions,
  questions => questions[0] && questions[0].display_logic,
)

export const getQuestionResults = createSelector(
  getQuestion,
  getResults,
  (question, results) => results[question.id] || {},
)

export const getPrevPage = (state): {element: string; page: number} => _.last(state.prevPages)
