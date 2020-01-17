import { block, blocks, question } from '../../../store/schema'
import { createSelector } from 'reselect'
import { denormalize } from 'normalizr'
import { nextElementId, nextParentElementId } from './helpers'

export const blockSelector = (state, ids) => denormalize(ids, [block], state)
export const questionsSelector = (state, ids) => denormalize(ids, [question], state)

export const selectBlock = (state, id) => state.blocks[id]
export const selectQuestion = (state, id) => state.questions[id]
export const errors = (state) => state.errors
export const results = (state) => state.results

export const allPages = (state) => state.allPages
export const currentPage = (state) => state.currentPage


export const currentBlockPagesSelector = state => state.allPages[state.currentBlock]

export const currentElementSelector = (state) => {
  return state.normalizedTree[state.currentElement]
}

export const currentPageSelector = state => {
  const block = currentElementSelector(state).props.current
  const pages = state.allPages[block]
  return pages[state.currentPage]
}

export const nextPageSelector = state => {
  const block = currentElementSelector(state).props.current
  const pages = state.allPages[block]
  return pages[state.currentPage + 1]
}

export const nextElementIdSelector = state => {
  let id:string | null = nextElementId(state.currentElement)
  if (state.normalizedTree[id]) {
    return id
  }

  while(id = nextParentElementId(id)) {
    if (state.normalizedTree[id]) {
      return id
    }
  }
  return null
}

export const pageQuestions = createSelector(
  state => state,
  currentPageSelector,
  (state, page) => questionsSelector(state, page.questions)
)

export const questionErrors = createSelector(
  selectQuestion,
  errors,
  (question, errors) => (errors && errors[question.id]) || []
)

export const pageErrors = state => state.errors


export const questionResults = createSelector(
  selectQuestion,
  results,
  (question, results) => results[question.id] || {}
)
