import { block, blocks, question } from 'store/schema'
import { createSelector } from 'reselect'
import { denormalize } from 'normalizr'

export const blockSelector = (state, ids) => denormalize(ids, [block], state)
export const questionsSelector = (state, ids) => denormalize(ids, [question], state)

export const selectBlock = (state, id) => state.blocks[id]
export const selectQuestion = (state, id) => state.questions[id]
export const errors = (state) => state.errors
export const results = (state) => state.results

export const allPages = (state) => state.allPages
export const currentPage = (state) => state.currentPage


export const currentBlockPagesSelector = state =>  state.allPages[state.currentBlock]

export const currentPageSelector = state => {
  const pages = state.allPages[state.currentBlock]
  return pages[state.currentPage]
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
