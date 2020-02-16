import _ from 'lodash'
import { createSelector } from 'reselect'
import { denormalize } from 'normalizr'
import { block, blocks, question } from '../../../store/schema'
import { nextElementId, nextParentElementId } from './helpers'

export const blockSelector = (state, ids) => denormalize(ids, [block], state)
export const questionsSelector = (state, ids) => denormalize(ids, [question], state)

export const selectBlock = (state, id) => state.blocks[id]
export const selectQuestion = (state, id) => state.questions[id]
export const errors = state => state.errors
export const results = state => state.results

export const allPages = state => state.allPages
export const currentPage = state => state.currentPage
export const elementSelector = (state, id) => state.normalizedTree[id]

export const currentBlockPagesSelector = state => state.allPages[state.currentBlock]

export const currentElementSelector = state => state.normalizedTree[state.currentElement]

export const selectElementIdByBlockId = (state, blockId) => _.findKey(
  state.normalizedTree, el => el.props && el.props.current === `${blockId}`,
)

export const currentPageSelector = (state) => {
  const block = currentElementSelector(state).props.current
  const pages = state.allPages[block]
  return pages[state.currentPage]
}

export const nextPageSelector = (state) => {
  const block = currentElementSelector(state).props.current
  const pages = state.allPages[block]
  return pages[state.currentPage + 1]
}

export const nextElementIdSelector = (state, element: string | null = null) => {
  let id: string | null = nextElementId(element || state.currentElement)
  if (state.normalizedTree[id]) {
    return id
  }

  // eslint-disable-next-line no-cond-assign
  while (id = nextParentElementId(id)) {
    if (state.normalizedTree[id]) {
      return id
    }
  }
  return null
}

export const childOrNextElementIdSelector = (state, element: string | null = null) => {
  const id = `${element || state.currentElement}/0`
  if (state.normalizedTree[id]) {
    return id
  }
  return nextElementIdSelector(state, id)
}

export const pageQuestions = createSelector(
  state => state,
  currentPageSelector,
  (state, page) => questionsSelector(state, page.questions),
)

export const pageQuestionsWithoutHidden = createSelector(pageQuestions, questions => questions.filter(q => !q.hidden))

export const questionErrors = createSelector(
  selectQuestion,
  errors,
  (question, errors) => (errors && errors[question.id]) || [],
)

export const pageErrors = state => state.errors

export const skipLogicSelector = createSelector(currentPageSelector, page => page.skipLogic)
export const displayLogicSelector = createSelector(
  pageQuestions,
  questions => questions[0] && questions[0].display_logic,
)

export const questionResults = createSelector(
  selectQuestion,
  results,
  (question, results) => results[question.id] || {},
)
