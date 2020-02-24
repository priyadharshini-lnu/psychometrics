/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import _ from 'lodash'
import { createSelector } from 'reselect'
import { denormalize } from 'normalizr'
import { question } from '../../../store/schema'
import GetNextElementId from './commands/GetNextElementId'
import GetNextParentElementId from './commands/GetNextParentElementId'
import {
  Question, Block, BlockElementInterface, ElementInterface, PageInterface, ResultsInterface,
} from './interfaces'

export const getQuestions = (state, ids): Question[] => denormalize(ids, [question], state)

export const getQuestion = (state, id): Question => state.questions[id]
export const getCurrentBlock = (state): Block => {
  const { blockId } = getCurrentPage(state)
  return state.blocks[blockId]
}
export const getErrors = (state): {[qId: number]: []} => state.errors
export const getResults = (state): ResultsInterface => state.results

export const currentPage = (state): number => state.currentPage

export const getElement = (state, id): ElementInterface => state.normalizedTree[id]
export const getCurrentElement = (state): BlockElementInterface => state.normalizedTree[state.currentElement]

export const getElementIdByBlockId = (state, blockId): string => _.findKey(
  state.normalizedTree, el => el.props && el.props.current === `${blockId}`,
)

export const getCurrentPage = (state): PageInterface => {
  const block = getCurrentElement(state).props.current
  const pages = state.allPages[block]
  return pages[state.currentPage]
}

export const getNextPage = (state): PageInterface => {
  const block = getCurrentElement(state).props.current
  const pages = state.allPages[block]
  return pages[state.currentPage + 1]
}

export const getNextElementId = (state, element: string | null = null): string | null => {
  let id: string | null = GetNextElementId.run(element || state.currentElement)
  if (state.normalizedTree[id]) {
    return id
  }

  // eslint-disable-next-line no-cond-assign
  while (id = GetNextParentElementId.run(id)) {
    if (state.normalizedTree[id]) {
      return id
    }
  }
  return null
}

export const getChildOrNextElementId = (state, element: string | null = null): string |null => {
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

export const pageErrors = (state): {[qId: number]: []} => state.errors

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
