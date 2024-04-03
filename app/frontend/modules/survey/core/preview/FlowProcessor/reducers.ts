import _ from 'lodash'
import { normalize } from 'normalizr'
import humps from 'humps'
import { createReducer } from '~/utils/redux'
import { setIn, updateIn } from '~/utils/immutable'
import InitPages from './commands/InitPages'
import NormalizeTree from './commands/NormalizeTree'
import InitLinearElements from './commands/InitLinearElements'
import { assessment } from '../../../store/schema'
import {
  INIT, ANSWER, SHOW_ERRORS, EMPTY_ERRORS, SHOW_PAGE,
  CHANGE_ELEMENT, SHOW_END, HIDE_END, SET_EMBEDDED_DATA, HIDE_QUESTION,
  ADD_PREV_PAGE, REMOVE_PREV_PAGE, SET_DIRTY_RESULTS, SHOW_QUESTION,
  SET_NOT_DIRTY_RESULTS, TOGGLE_HIDDEN_QUESTIONS, TOGGLE_IGNORE_VALIDATION,
  RESET, SAVE_RESULTS, SAVE_RESULTS_REQUEST, SAVE_RESULTS_FAILURE, UPDATE_HIGHLIGHT_REQUEST, SET_LOCAL_RESULTS,
  MARK_QUESTION_IN_PROGRESS, REMOVE_QUESTION_IN_PROGRESS, CLEAR_IN_PROGRESS_QUESTION,
  ADD_QUESTION_ERROR, REMOVE_QUESTION_ERROR, MARK_ASSESSMENT_TIMED_OUT,
  ADD_MEDIA_RESPONSE, REMOVE_MEDIA_RESPONSE, MARK_MEDIA_RESPONSE_AS_SELECTED,
  SHOW_SUBMIT_PAGE, HIDE_SUBMIT_PAGE, SET_IS_SIMULATION, FETCH_QUESTION_SCORING,
  ACTIVE_DICTATION_ON_QUESTION, NEXT_BUTTON_PRESSED, BACK_BUTTON_PRESSED,
  SHOW_ERROR_WARNING, PREV_PAGE_REQUEST, PREV_PAGE_FAILURE,
  SET_SUBMISSION_IN_PROGRESS,
} from './consts'
import {
  DefaultState, AddPrevPage, ShowErrors, ShowPage,
  ChangeElement, HideQuestion, ShowQuestion, SetEmbeddedData,
  SetDirtyResults, SetNotDirtyResults, SetLocalResults,
  InProgressQuestion, MediaResponse, MarkQuestionInProgress,
  RemoveQuestionInProgress, Highlight, AnswerType,
  InitType, AddQuestionError, RemoveQuestionError,
  SaveResults, UpdateHightlight, AddMediaResponse, RemoveMediaResponse,
  MarkMediaResponseAsSelected, FetchQuestionScoring,
  ShowEnd, SetSubmissionInProgress,
} from './interfaces'
import { SetDictationActiveOnQuestion } from './actions'

const { I18n } = window
type State = DefaultState

const defaultState: State = {
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
  showSubmitPage: false,
  expiryDate: null,
  timerDuration: null,
  isSimulation: false,
  factors: [],
  scoring: null,
  showScoringOnEndPage: false,
  showQuestionScoring: false,
  activeDictationOnQuestion: 0,
  enableSingleQuestionPage: false,
  options: {},
  nextButtonPressed: false,
  backButtonPressed: false,
  started: false,
  instructions: { enabled: false, content: '' },
  fixedTimed: false,
  showErrorWarning: false,
  isAssessor: false,
  nextAssessmentUrl: null,
  submitRequired: false,
  otherPendingAssessmentCount: 0,
}

const HANDLERS = {
  [INIT]: (state, { data, result }: InitType) => {
    const normalizedData = normalize({ blocks: data.blocks }, assessment)
    const resultsUrl = data.resultsUrl || `/assigns/${result.id}`

    let { elements } = (data.flow || { elements: [] })
    if (elements.length === 0) {
      elements = InitLinearElements.run(data.blocks)
    }

    const randomseed = (result.seedrandom || Date.now()).toString()
    const normalizedTree = NormalizeTree.run(elements, randomseed)

    // saga triggers next_page to process element '0'
    if (data.locale) {
      I18n.locale = data.locale
    }

    const highlights = (result.highlights || []).map<Highlight>(h => ({
      id: h.id,
      data: h.data,
      resourceType: h.resource_type,
      resourceId: h.resource_id,
    }))
    const mediaResponses = result.media_responses

    return {
      ...defaultState,
      initialized: true,
      name: data.name,
      assessmentCategory: data.category,
      type: data.type || 'preview_assessment',
      isThreesixty: data.isThreesixty,
      dashboardUrl: data.dashboardUrl || '/',
      dataSheetColumns: data.data_sheet_columns,
      relationships: data.relationships,
      relationship: result.relationship,
      isAnonymousAssessment: data.isAnonymousAssessment,
      allowMultipleResponses: data.allow_multiple_responses,
      readOnly: data.readOnly,
      mediaUrl: resultsUrl,
      resultsUrl,
      enableBack: data.enable_back,
      enableProgress: data.enable_progress,
      enableSingleQuestionPage: data.options?.enable_single_question_page,
      allPages: InitPages.run(data, randomseed, data.options),
      normalizedTree,
      normRules: data.norm_rules,
      hrisData: result.hris || {},
      elements: data.flow?.elements,
      linear: data.flow?.elements?.length === 0,
      blocks: normalizedData.entities.blocks,
      questions: normalizedData.entities.questions,
      currentElement: result.current_element || null,
      currentPage: result.current_page || 0,
      randomseed,
      dataSheet: result.data_sheet,
      subjectDataSheet: result.subject_datasheet,
      dbResult: _.omit(result, 'media_responses'),
      mediaResponses: humps.camelizeKeys(mediaResponses),
      results: result.results || result.answers || {},
      campaignUser: result.campaign_user,
      isTimedCampaign: result.campaign_options?.fixed_time,
      expiryDate: result.expiry_date,
      timerDuration: data.timer_duration,
      metaData: result.meta_data || {},
      locales: data.locales,
      agileAssetsUrl: data.agileAssetsUrl,
      agileAssignUrl: data.agileAssignUrl,
      end: data.notAnEndPage ? false : result.status === 'completed',
      prevPages: data.readOnly ? [] : (result.prev_pages || []),
      highlights: _.keyBy(highlights, 'id'),
      assessmentTimedOut: result.timed_out || false,
      factors: data.factors,
      scoring: result.scoring,
      showScoringOnEndPage: data.showScoringOnEndPage,
      showQuestionScoring: data.showQuestionScoring,
      options: data.options || {},
      started: data.type === 'preview_assessment' || !!result.started_at,
      instructions: data.instructions,
      fixedTimed: data.fixed_timed,
      defaultNorm: data.default_norm_id,
      isAssessor: data.isAssessor,
      nextAssessmentUrl: result.next_assessment_url,
      otherPendingAssessmentCount: result.other_pending_assessments_count,
      linkedQuestions: data.linked_questions,
    }
  },
  [SET_LOCAL_RESULTS]: (state: State, { data }: SetLocalResults) => {
    const results = _.reduce(data, (acc, result, key) => (
      acc[key] || (!state.questions[key]) ? acc : setIn(acc, key, result)
    ), state.results)
    return setIn(state, 'results', results)
  },
  [ANSWER]: (state: State, { result }: AnswerType) => setIn(state, ['results', result.question_id], result),
  [SHOW_ERRORS]: (state: State, { errors }: ShowErrors) => setIn(state, ['errors'], errors),
  [EMPTY_ERRORS]: (state: State) => setIn(state, ['errors'], defaultState.errors),
  [CHANGE_ELEMENT]: (state: State, { id, page }: ChangeElement) => ({
    ...state, currentPage: page || 0, currentElement: id,
  }),
  [SHOW_PAGE]: (state: State, { page }: ShowPage) => ({ ...state, currentPage: page }),
  [ADD_PREV_PAGE]: (state: State, { page }: AddPrevPage) => ({
    ...state, prevPages: [...state.prevPages, page],
  }),
  [ADD_QUESTION_ERROR]: (state: State, { questionId, errors }: AddQuestionError) => (
    setIn(state, ['errors', questionId], errors)
  ),
  [REMOVE_QUESTION_ERROR]: (state: State, { questionId }: RemoveQuestionError) => (
    setIn(state, ['errors'], _.omit(state.errors, [questionId]))
  ),
  [REMOVE_PREV_PAGE]: (state: State) => setIn(state, 'prevPages', _.slice(state.prevPages, 0, -1)),
  [SHOW_END]: (state: State, { payload: endOfAssessmentElementProps }: ShowEnd) => (
    {
      ...state, end: true, endOfAssessmentElementProps, showSubmitPage: false,
    }),
  [HIDE_END]: (state: State) => ({ ...state, end: false }),
  [SET_EMBEDDED_DATA]: (state: State, { data }: SetEmbeddedData) => setIn(
    state, 'embeddedData', { ...state.embeddedData, ...data },
  ),
  [HIDE_QUESTION]: (state: State, { id }: HideQuestion) => setIn(state, ['questions', id, 'hidden'], true),
  [SHOW_QUESTION]: (state: State, { id }: ShowQuestion) => setIn(state, ['questions', id, 'hidden'], false),
  [SET_DIRTY_RESULTS]: (state: State, { questionIds: ids }: SetDirtyResults) => {
    const results = ids.reduce((results, id) => {
      if (!state.results[id]) { return results }
      return setIn(results, [id, 'dirty'], true)
    }, state.results)
    return {
      ...state,
      results: { ...state.results, ...results },
    }
  },
  [SET_NOT_DIRTY_RESULTS]: (state: State, { questionIds: ids }: SetNotDirtyResults) => {
    const results = ids.reduce((results, id) => {
      if (!state.results[id]) { return results }
      return setIn(results, [id, 'dirty'], false)
    }, state.results)
    return {
      ...state,
      results: { ...state.results, ...results },
    }
  },
  [TOGGLE_HIDDEN_QUESTIONS]: (state: State) => setIn(state, ['hideHiddenQuestions'], !state.hideHiddenQuestions),
  [TOGGLE_IGNORE_VALIDATION]: (state: State) => setIn(state, ['ignoreValidations'], !state.ignoreValidations),
  [RESET]: (state: State) => ({
    ...state, results: {}, currentElement: null, current_page: 0, end: false,
  }),
  [PREV_PAGE_REQUEST]: state => ({ ...state, submissionInProgress: state.type === 'pass_assessment' }),
  [PREV_PAGE_FAILURE]: state => ({ ...state, submissionInProgress: false, submissionFailed: true }),
  [SAVE_RESULTS_REQUEST]: state => ({ ...state, submissionInProgress: true }),
  [SAVE_RESULTS]: ({ ...state }: State, {
    response: {
      expired, current_block: currentBlock, factors, scoring, translations, next_assessment_url: nextAssessmentUrl,
    },
  }: SaveResults) => {
    const blocks = currentBlock
      ? setIn(state.blocks, currentBlock.id, { ...state.blocks[currentBlock.id], props: currentBlock.props })
      : state.blocks
    const end = expired || state.end
    const questions = currentBlock?.questions ? _.keyBy(currentBlock.questions, 'id') : {}
    const newQuestions = _.reduce(questions, (acc, q, key) => ({
      ...acc,
      [key]: { ...state.questions[q.id], ...q },
    }), state.questions)

    return end && !state.showSubmitPage ? {
      ...state,
      end,
      blocks,
      currentElement: null,
      currentPage: null,
      factors,
      scoring,
      submissionInProgress: false,
      nextAssessmentUrl,
    } : {
      ...state,
      end,
      blocks,
      locales: translations,
      questions: newQuestions,
      submissionInProgress: false,
      nextAssessmentUrl,
    }
  },
  [SAVE_RESULTS_FAILURE]: state => ({ ...state, submissionFailed: true, submissionInProgress: false }),
  [UPDATE_HIGHLIGHT_REQUEST]: (state: State, { payload }: UpdateHightlight) => {
    if (_.get(state, ['highlights', payload.id])) return setIn(state, ['highlights', payload.id], payload)

    return { ...state, highlights: { ...state.highlights, [payload.id]: payload } }
  },
  [MARK_QUESTION_IN_PROGRESS]: (state: State, { questionId, progressState }: MarkQuestionInProgress) => {
    const { inProgressQuestions } = state
    const currentQuestion = _.find(inProgressQuestions, { questionId })
    if (currentQuestion) {
      return updateIn(state, 'inProgressQuestions', (questions: InProgressQuestion[]) => (
        questions.map(question => (question.questionId === questionId ? { questionId, progressState } : question))
      ))
    }
    return { ...state, inProgressQuestions: [...inProgressQuestions, { questionId, progressState }] }
  },
  [REMOVE_QUESTION_IN_PROGRESS]: (state: State, { questionId }: RemoveQuestionInProgress) => {
    const inProgressQuestions = _.filter(state.inProgressQuestions, ({ questionId: id }) => id !== questionId)
    return { ...state, inProgressQuestions }
  },
  [CLEAR_IN_PROGRESS_QUESTION]: (state: State) => ({ ...state, inProgressQuestions: [] }),
  [MARK_ASSESSMENT_TIMED_OUT]: (state: State) => ({ ...state, assessmentTimedOut: true }),
  [ADD_MEDIA_RESPONSE]: (state: State, { payload: { mediaResponse } }: AddMediaResponse) => (
    { ...state, mediaResponses: [...state.mediaResponses, mediaResponse] }),
  [REMOVE_MEDIA_RESPONSE]: (state: State, { payload: { questionId } }: RemoveMediaResponse) => (
    updateIn(state, ['mediaResponses'], (mediaResponses: MediaResponse[]) => (
      _.filter(mediaResponses, ({ questionId: qid }) => qid !== questionId)))
  ),
  [MARK_MEDIA_RESPONSE_AS_SELECTED]:
    (state: State, { payload: { mediaResponse } }: MarkMediaResponseAsSelected) => {
      const { questionId } = mediaResponse

      return updateIn(state, ['mediaResponses'], (mediaResponses: MediaResponse[]) => (
        _.map(mediaResponses, (mr) => {
          const { questionId: qid, id } = mr

          if (questionId !== qid) return mr
          if (id === mediaResponse.id) return { ...mr, userSelected: true }
          return { ...mr, userSelected: false }
        })
      ))
    },
  [SHOW_SUBMIT_PAGE]: (state: State) => ({ ...state, submitRequired: true, showSubmitPage: true }),
  [HIDE_SUBMIT_PAGE]: (state: State) => ({ ...state, submitRequired: false, showSubmitPage: false }),
  [SET_IS_SIMULATION]: (state: State) => ({ ...state, isSimulation: true }),
  [SET_SUBMISSION_IN_PROGRESS]: (state: State, { value }: SetSubmissionInProgress) => ({
    ...state, submissionInProgress: value,
  }),
  [NEXT_BUTTON_PRESSED]: (state: State) => ({
    ...state, backButtonPressed: false, nextButtonPressed: true, submissionInProgress: state.type === 'pass_assessment',
  }),
  [BACK_BUTTON_PRESSED]: (state: State) => ({
    ...state, backButtonPressed: true, nextButtonPressed: false, submissionInProgress: state.type === 'pass_assessment',
  }),
  [FETCH_QUESTION_SCORING]: (state: State, { response }: FetchQuestionScoring) => ({
    ...state, scoring: response,
  }),
  [ACTIVE_DICTATION_ON_QUESTION]: (state: State, { payload: { questionId } }: SetDictationActiveOnQuestion) => ({
    ...state, activeDictationOnQuestion: questionId,
  }),
  [SHOW_ERROR_WARNING]: (state: State) => ({ ...state, showErrorWarning: true }),
}

export default createReducer(HANDLERS, defaultState)
