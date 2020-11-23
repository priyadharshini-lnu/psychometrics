/* eslint-disable @typescript-eslint/explicit-function-return-type */
import _ from 'lodash'
import { createReducer, Payload } from 'utils/redux'
import { normalize } from 'normalizr'
import { setIn, updateIn } from 'utils/immutable'
import humps from 'humps'
import InitPages from './commands/InitPages'
import NormalizeTree from './commands/NormalizeTree'
import InitLinearElements from './commands/InitLinearElements'
import { assessment } from '../../../store/schema'
import {
  INIT, ANSWER, SHOW_ERRORS, EMPTY_ERRORS, SHOW_PAGE,
  CHANGE_ELEMENT, SHOW_END, SET_EMBEDDED_DATA, HIDE_QUESTION,
  ADD_PREV_PAGE, REMOVE_PREV_PAGE, SET_DIRTY_RESULTS, SHOW_QUESTION,
  SET_NOT_DIRTY_RESULTS, TOGGLE_HIDDEN_QUESTIONS, TOGGLE_IGNORE_VALIDATION,
  RESET, SAVE_RESULTS, UPDATE_HIGHLIGHT_REQUEST, SET_LOCAL_RESULTS,
  MARK_QUESTION_IN_PROGRESS, REMOVE_QUESTION_IN_PROGRESS, CLEAR_IN_PROGRESS_QUESTION,
  ADD_QUESTION_ERROR, REMOVE_QUESTION_ERROR, MARK_ASSESSMENT_TIMED_OUT,
  ADD_MEDIA_RESPONSE, REMOVE_MEDIA_RESPONSE, MARK_MEDIA_RESPONSE_AS_SELECTED,
} from './consts'
import {
  DefaultState, AddPrevPage, ShowErrors, ShowPage,
  ChangeElement, HideQuestion, ShowQuestion, SetEmbeddedData,
  SetDirtyResults, SetNotDirtyResults, SetLocalResults,
  InProgressQuestion, QuestionError, MediaResponse,
} from './interfaces'

const { I18n } = window

const defaultState: DefaultState = {
  initialized: false,
  isThreesixty: false,
  hideHiddenQuestions: true,
  ignoreValidations: false,
  readOnly: false,
  type: 'preview_assessment',
  enableBack: false,
  enableProgress: false,
  linear: false,
  elements: [],
  blocks: {},
  questions: {},
  embeddedData: {},
  normalizedTree: {},
  allPages: {}, // {[blockId]: [{questions: [1,2,3], blockId}]}
  results: {},
  prevPages: [], // [{element, page}, {element, page} ...]
  currentElement: null,
  currentPage: 0,
  errors: {},
  end: false,
  dashboardUrl: '/',
  mediaUrl: null,
  dataSheetColumns: [],
  dataSheet: [],
  subjectDataSheet: [],
  relationships: [],
  relationship: null,
  locales: null,
  inProgressQuestions: [],
  highlights: {},
  assessmentTimedOut: false,
  mediaResponses: [],
}

const HANDLERS = {
  [INIT]: (state, { data, result }) => {
    const normalizedData = normalize({ blocks: data.blocks }, assessment)
    const resultsUrl = data.resultsUrl || `/assigns/${result.id}`

    let { elements } = data.flow
    if (elements.length === 0) {
      elements = InitLinearElements.run(data.blocks)
    }
    const normalizedTree = NormalizeTree.run(elements)

    // saga triggers next_page to process element '0'
    if (data.locale) {
      I18n.locale = data.locale
    }

    const highlights = (result.highlights || []).map(h => ({
      id: h.id,
      data: h.data,
      resourceType: h.resource_type,
      resourceId: h.resource_id,
    }))
    const mediaResponses = result.media_responses

    return {
      ...defaultState,
      initialized: true,
      assessmentCategory: data.category,
      type: data.type || 'preview_assessment',
      isThreesixty: data.isThreesixty,
      dashboardUrl: data.dashboardUrl || '/',
      dataSheetColumns: data.data_sheet_columns,
      relationships: data.relationships,
      relationship: result.relationship,
      isAnonymousAssessment: data.isAnonymousAssessment,
      readOnly: data.readOnly,
      mediaUrl: resultsUrl,
      resultsUrl,
      enableBack: data.enable_back,
      enableProgress: data.enable_progress,
      allPages: InitPages.run(data, result.id || Date.now()),
      normalizedTree,
      normRules: data.norm_rules,
      hrisData: result.hris || {},
      elements: data.flow.elements,
      linear: data.flow.elements.length === 0,
      blocks: normalizedData.entities.blocks,
      questions: normalizedData.entities.questions,
      currentElement: result.current_element || null,
      currentPage: result.current_page || 0,
      randomseed: result.id || Date.now(), // use assign or user id
      dataSheet: result.data_sheet,
      subjectDataSheet: result.subject_datasheet,
      dbResult: _.omit(result, 'media_responses'),
      mediaResponses: humps.camelizeKeys(mediaResponses),
      results: result.results || result.answers || {},
      expiryDate: result.expiry_date,
      timerDuration: data.timer_duration,
      metaData: result.meta_data || {},
      locales: data.locales,
      agileAssetsUrl: data.agileAssetsUrl,
      agileAssignUrl: data.agileAssignUrl,
      end: data.notAnEndPage ? false : result.status === 'completed',
      prevPages: result.prev_pages || [],
      highlights: _.keyBy(highlights, 'id'),
    }
  },
  [SET_LOCAL_RESULTS]: (state, { data }: SetLocalResults) => {
    const results = _.reduce(data, (acc, result, key) => (
      acc[key] || (!state.questions[key]) ? acc : setIn(acc, key, result)
    ), state.results)
    return setIn(state, 'results', results)
  },
  [ANSWER]: (state, { result }) => setIn(state, ['results', result.question_id], result),
  [SHOW_ERRORS]: (state, { errors }: ShowErrors) => setIn(state, ['errors'], errors),
  [EMPTY_ERRORS]: state => setIn(state, ['errors'], defaultState.errors),
  [CHANGE_ELEMENT]: (state, { id, page }: ChangeElement) => ({ ...state, currentPage: page || 0, currentElement: id }),
  [SHOW_PAGE]: (state, { page }: ShowPage) => ({ ...state, currentPage: page }),
  [ADD_PREV_PAGE]: (state, { page }: AddPrevPage) => ({ ...state, prevPages: [...state.prevPages, page] }),
  [ADD_QUESTION_ERROR]: (state, { questionId, errors }: { questionId: number, errors: QuestionError}) => (
    setIn(state, ['errors', questionId], errors)
  ),
  [REMOVE_QUESTION_ERROR]: (state, { questionId }: { questionId: number}) => (
    setIn(state, ['errors'], _.omit(state.errors, [questionId]))
  ),
  [REMOVE_PREV_PAGE]: state => setIn(state, 'prevPages', _.slice(state.prevPages, 0, -1)),
  [SHOW_END]: state => ({ ...state, end: true }),
  [SET_EMBEDDED_DATA]: (state, { data }: SetEmbeddedData) => setIn(
    state, 'embeddedData', { ...state.embeddedData, ...data },
  ),
  [HIDE_QUESTION]: (state, { id }: HideQuestion) => setIn(state, ['questions', id, 'hidden'], true),
  [SHOW_QUESTION]: (state, { id }: ShowQuestion) => setIn(state, ['questions', id, 'hidden'], false),
  [SET_DIRTY_RESULTS]: (state, { questionIds: ids }: SetDirtyResults) => {
    const results = ids.reduce((results, id) => {
      if (!state.results[id]) { return results }
      return setIn(results, [id, 'dirty'], true)
    }, state.results)
    return {
      ...state,
      results: { ...state.results, ...results },
    }
  },
  [SET_NOT_DIRTY_RESULTS]: (state, { questionIds: ids }: SetNotDirtyResults) => {
    const results = ids.reduce((results, id) => {
      if (!state.results[id]) { return results }
      return setIn(results, [id, 'dirty'], false)
    }, state.results)
    return {
      ...state,
      results: { ...state.results, ...results },
    }
  },
  [TOGGLE_HIDDEN_QUESTIONS]: state => setIn(state, ['hideHiddenQuestions'], !state.hideHiddenQuestions),
  [TOGGLE_IGNORE_VALIDATION]: state => setIn(state, ['ignoreValidations'], !state.ignoreValidations),
  [RESET]: state => ({
    ...state, results: {}, currentElement: null, current_page: 0, end: false,
  }),
  [SAVE_RESULTS]: (state, { response: { expired, currentBlock } }) => {
    const blocks = currentBlock
      ? setIn(state.blocks, currentBlock.id, { ...state.blocks[currentBlock.id], props: currentBlock.props })
      : state.blocks
    const end = expired || state.end
    return end ? {
      ...state, end, blocks, currentElement: null, currentPage: null,
    } : { ...state, end, blocks }
  },
  [UPDATE_HIGHLIGHT_REQUEST]: (state, { payload }) => {
    if (_.get(state, ['highlights', payload.id])) return setIn(state, ['highlights', payload.id], payload)

    return { ...state, highlights: { ...state.highlights, [payload.id]: payload } }
  },
  [MARK_QUESTION_IN_PROGRESS]: (state, { questionId, progressState }: { questionId: number, progressState: string}) => {
    const { inProgressQuestions } = state
    const currentQuestion: InProgressQuestion = _.find(inProgressQuestions, { questionId })
    if (currentQuestion) {
      return updateIn(state, 'inProgressQuestions', (questions: InProgressQuestion[]) => (
        questions.map(question => (question.questionId === questionId ? { questionId, progressState } : question))
      ))
    }
    return { ...state, inProgressQuestions: [...inProgressQuestions, { questionId, progressState }] }
  },
  [REMOVE_QUESTION_IN_PROGRESS]: (state, { questionId }: { questionId: string}) => {
    const inProgressQuestions = _.filter(state.inProgressQuestions, ({ questionId: id }) => id !== questionId)
    return { ...state, inProgressQuestions }
  },
  [CLEAR_IN_PROGRESS_QUESTION]: state => ({ ...state, inProgressQuestions: [] }),
  [MARK_ASSESSMENT_TIMED_OUT]: state => ({ ...state, assessmentTimedOut: true }),
  [ADD_MEDIA_RESPONSE]: (state, { payload: { mediaResponse } }: Payload<{ mediaResponse: MediaResponse }>) => (
    { ...state, mediaResponses: [...state.mediaResponses, mediaResponse] }),
  [REMOVE_MEDIA_RESPONSE]: (state, { payload: { questionId } }: Payload<{ questionId: number }>) => (
    updateIn(state, ['mediaResponses'], (mediaResponses: MediaResponse[]) => (
      _.filter(mediaResponses, ({ questionId: qid }) => qid !== questionId)))
  ),
  [MARK_MEDIA_RESPONSE_AS_SELECTED]:
    (state, { payload: { mediaResponse } }: Payload<{ mediaResponse: MediaResponse }>) => {
      const { questionId } = mediaResponse

      return updateIn(state, ['mediaResponses'], (mediaResponses: MediaResponse[]) => (
        _.map(mediaResponses, (mr) => {
          const { questionId: qid, id } = mr

          if (questionId !== qid) return mediaResponse
          if (id === mediaResponse.id) return { ...mr, userSelected: true }
          return { ...mr, userSelected: false }
        })
      ))
    },
}

export default createReducer(HANDLERS, defaultState)
