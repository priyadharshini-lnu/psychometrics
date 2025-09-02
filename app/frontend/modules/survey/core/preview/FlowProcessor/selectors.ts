/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import _ from 'lodash'
import { createSelector } from 'reselect'
import { denormalize } from 'normalizr'
import { v4 as genUUID } from 'uuid'
import { question } from '../../../store/schema'
import GetNextElementId from './commands/GetNextElementId'
import GetNextParentElementId from './commands/GetNextParentElementId'
import {
  Question, Block, BlockElementInterface, ElementInterface, PageInterface, ResultsInterface,
  I18nInterface, Highlight, MediaResponse,
} from './interfaces'
import BranchProcessor from './commands/BranchProcessor'

let { I18n } = window
if (I18n) {
  I18n.fallbacks = true
} else {
  I18n = {
    t (code: string): string {
      return code
    },
  }
}

export const getQuestions = (state, ids): Question[] => denormalize(ids, [question], state)
export const getAllAnsweredQuestions = (state): Question[] => {
  const pages = _.map(Object.getOwnPropertySymbols(state.allPages), key => state.allPages[key])

  return _.reduce(
    pages, (res, block) => {
      const questions = _.flatten(_.map(
        block, page => getQuestions(state, page.questions).filter(
          question => state.results[question.id] || getMediaResponseByQuestionId(state, question.id),
        ),
      ))

      return [...res, ...questions]
    }, [],
  )
}

export const getQuestion = (state, id): Question => state.questions[id]
export const getCurrentBlock = (state): Block => {
  const { blockId } = getCurrentPage(state) || {}
  return state.blocks[blockId]
}
export const getErrors = (state): {[qId: number]: []} => state.errors
export const getResults = (state): ResultsInterface => state.results

export const isAssessmentTimedOut = (state): boolean => state.assessmentTimedOut

export const currentPage = (state): number => state.currentPage

export const getElement = (state, id): ElementInterface => state.normalizedTree[id]
export const getCurrentElement = (state): BlockElementInterface => {
  if (state.type === 'block_preview') {
    return state.normalizedTree[0]
  }

  return state.normalizedTree[state.currentElement]
}

export const getElementIdByBlockId = (state, blockId) => _.findKey(
  state.normalizedTree, el => el.props && el.props.current === `${blockId}`,
)

export const isValidCurrentElementAndPage = (state): boolean => {
  try {
    getCurrentPage(state)
  } catch (e) {
    return false
  }
  return true
}

export const getCurrentPage = (state): PageInterface => {
  const block = getCurrentElement(state)?.props?.current
  const pages = state.allPages[Symbol.for(block)]
  return pages && pages[state.currentPage]
}

export const getNextPage = (state): PageInterface => {
  const block = getCurrentElement(state).props.current
  const pages = state.allPages[Symbol.for(block)]
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
  (state, page: PageInterface) => getQuestions(state, page?.questions),
)

export const pageQuestionsWithoutHidden = createSelector(
  pageQuestions,
  questions => questions && questions.filter(q => !q.hidden),
)

export const getQuestionErrors = createSelector(
  getQuestion,
  getErrors,
  (question, errors) => (question && errors && errors[question.id]) || [],
)

export const pageErrors = (state): {[qId: number]: []} => state.errors

export const getSkipLogicSelector = createSelector(getCurrentPage, page => page.skipLogic)
export const getDisplayLogicSelector = createSelector(
  pageQuestions,
  questions => questions && questions[0] && questions[0].display_logic,
)

export const getQuestionResults = createSelector(
  getQuestion,
  getResults,
  (question, results) => (question && results[question.id]) || {},
)

export const getPrevPage = (state): {element: string; page: number, questionIds: number[]} | undefined => (
  _.last(state.prevPages)
)

export const getBlockIds = (state): string[] => _.reduce(
  state.normalizedTree, (ids, el) => (el.type === 'Block' ? [...ids, el.props.current] : ids), [],
)

export const getPrevBlockIds = (state): string[] => {
  let ids: string[] = []
  let path: string | null = '0'
  while (path) {
    const el = state.normalizedTree[path]
    if (!el || path === state.currentElement) {
      return state.currentPage > 0 ? [...ids, el.props.current] : ids
    }
    if (el.type === 'Branch' && !BranchProcessor.run(state, el)) {
      path = getNextElementId(state, path)
      // eslint-disable-next-line no-continue
      continue
    }

    ids = el.type === 'Block' ? [...ids, el.props.current] : ids
    path = getChildOrNextElementId(state, path)
  }
  return ids
}

const pagesQuestions = (pages: PageInterface[]): number => _.flatten(_.map(pages, 'questions')).length

export const getQuestionsCount = (state, blockIds: string[]): number => _.sumBy(
  blockIds, id => pagesQuestions(state.allPages[Symbol.for(id)]),
)

export const lookForEndOfAssessment = (el: string, state): string | null => {
  let path = GetNextElementId.run(el)
  while (path) {
    const element = state.normalizedTree[path]
    if (!element) { return null }
    if (element.type === 'EndOfAssessment') {
      return path
    }
    path = GetNextElementId.run(path)
  }
  return null
}

export const getPossibleBlocks = (state): string[] => {
  let ids: string[] = []
  let path: string | null = state.currentElement
  const maybeTopEnd: string | null = lookForEndOfAssessment('0', state)
  const maybeEnd: string | null = lookForEndOfAssessment(state.currentElement || '', state)
  while (path) {
    const el = state.normalizedTree[path]
    if (!el) { return ids }
    if (el.type === 'Block' && path === state.currentElement
           && state.currentPage < state.allPages[Symbol.for(el.props.current)].length) {
      ids = [...ids, el.props.current]
      path = getChildOrNextElementId(state, path)
      // eslint-disable-next-line no-continue
      continue
    }

    if (el.type === 'Branch' && !BranchProcessor.run(state, el)) {
      path = getNextElementId(state, path)
      // eslint-disable-next-line no-continue
      continue
    }
    ids = el.type === 'Block' ? [...ids, el.props.current] : ids
    if ((maybeTopEnd === path) || (maybeEnd === path)) {
      return ids
    }
    path = getChildOrNextElementId(state, path)
  }
  return ids
}

export const getPrevQuestionsCount = (state): number => {
  const blockIds = getPrevBlockIds(state)
  if (state.currentPage > 0) {
    const [last, ...ids] = _.reverse(blockIds)
    const count = getQuestionsCount(state, ids)
    return count + pagesQuestions(_.take(state.allPages[Symbol.for(last)], state.currentPage))
  }
  return getQuestionsCount(state, blockIds)
}

export const getPossibleQuestionsCount = (state): number => {
  const blockIds = getPossibleBlocks(state)
  const [current, ...ids] = blockIds
  if (!current) { return 0 }
  const count = getQuestionsCount(state, ids)
  const currentPage = state.allPages[Symbol.for(current)]
  return count + pagesQuestions(_.takeRight(currentPage, currentPage.length - state.currentPage))
}

export const getProgress = (state): number | undefined => {
  if (!state.initialized) { return }
  if (state.end || state.showSubmitPage) { return 100 }
  const prevQuestions = getPrevQuestionsCount(state)
  const possibleQuestionsCount = getPossibleQuestionsCount(state)
  return _.round((prevQuestions / (prevQuestions + possibleQuestionsCount)) * 100) || 0
}

export const getHighlightByType = ({ preview },
  id: number,
  type: string): object => _.find(preview.highlights,
  (h: Highlight) => h.resourceId === id && h.resourceType === type) || {
  id: genUUID(),
  data: [],
  resourceId: id,
  resourceType: type,
}

export const getI18n = ({ locales, instructions, locale }): I18nInterface => ({
  t (code: string, data: any): string {
    return I18n.t(code, data)
  },
  lookup (code: string): string {
    return I18n.lookup(code)
  },
  tQuestion (question: any, field: string, extraData: any): string {
    question.isNeedToAddLtrManually = false
    question.isAnyArabicTranslateExist = true

    if (locales?.question?.[question.id] || locale === 'ar') {
      question.isNeedToAddLtrManually = false
      question.isAnyArabicTranslateExist = true
      return locales?.question?.[question.id]?.[field] || question?.props?.[field]
    }
    if (question.id) {
      question.isNeedToAddLtrManually = true
    }
    return question.tDefault(field, extraData)
  },
  tBlock (block: Block, key: string, path: string[]): string {
    const propsPath = path || [key]
    return _.get(locales, ['block', block.id, key]) || _.get(block, ['props', ...propsPath])
  },
  tCustomValidation (question: any, message: string, uuid: string): string {
    return _.get(locales, ['question', question.id, `customValidationText_${uuid}`], message)
  },
  tInstructions () {
    return instructions?.enabled ? _.get(locales, ['instructions', 0, 'content']) || instructions?.content : null
  },
  uiLocale: I18n.uiLocale,
})

export const getMediaResponsesByQuestionId = createSelector(
  (state: { mediaResponses: MediaResponse[] }, questionId: number) => (
    _.filter(state.mediaResponses, ({ questionId: qid }) => qid === questionId)
  ),
  (mediaResponses: MediaResponse[]) => _.sortBy(mediaResponses, ({ createdAt }) => Date.parse(createdAt)),
)

export const getMediaResponseByQuestionId = (state, questionId: number) => (
  getMediaResponsesByQuestionId(state, questionId)[0]
)

export const getQuestionScoring = (
  store,
  questionId,
): Record<number, { score: number }> => _.reduce(
  store.scoring,
  (acc, s, k) => {
    if (_.some(s.results, q => q.questionId === questionId)) {
      return { ...acc, [k]: { score: s.score } }
    }
    return acc
  },
  {},
)

export const getQuestionWithActiveDictation = state => state.activeDictationOnQuestion

export const endOfAssessmentReached = (preview): boolean => (
  !preview.showSubmitPage && (preview.end || preview.dbResult.status === 'completed')
)

export const getCompletionStatusCode = (preview): string | null => {
  if (!endOfAssessmentReached(preview)) return null

  return preview.endOfAssessmentElementProps?.completionStatusCode
}

export const getStatus = (preview): string => {
  if (endOfAssessmentReached(preview)) {
    if (preview.endOfAssessmentElementProps?.markAsInEligible) { return 'ineligible' }

    return 'completed'
  }

  return 'in_progress'
}
