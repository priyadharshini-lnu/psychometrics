/* eslint-disable @typescript-eslint/explicit-function-return-type */
import _ from 'lodash'
import { createReducer } from 'utils/reduxUtils'
import { normalize } from 'normalizr'
import { setIn } from 'utils/immutable'
import InitPages from './commands/InitPages'
import NormalizeTree from './commands/NormalizeTree'
import InitLinearElements from './commands/InitLinearElements'
import { DefaultState } from './interfaces'
import { assessment } from '../../../store/schema'
import {
  INIT, ANSWER, SHOW_ERRORS, EMPTY_ERRORS, SHOW_PAGE,
  CHANGE_ELEMENT, SHOW_END, SET_EMBEDDED_DATA, HIDE_QUESTION,
  ADD_PREV_PAGE, REMOVE_PREV_PAGE, SET_DIRTY_RESULTS, SHOW_QUESTION,
  SET_NOT_DIRTY_RESULTS, TOGGLE_HIDDEN_QUESTIONS, TOGGLE_IGNORE_VALIDATION,
  RESET, SAVE_RESULTS, UPDATE_META_DATA_REQUEST,
} from './consts'

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
  errors: null,
  end: false,
  dashboardUrl: '/',
  mediaUrl: null,
  dataSheetColumns: [],
  dataSheet: [],
  subjectDataSheet: [],
  relationships: [],
  relationship: null,
}

const HANDLERS = {
  [INIT]: (state, { data, result }) => {
    const normalizedData = normalize({ blocks: data.blocks }, assessment)
    let { elements } = data.flow
    if (elements.length === 0) {
      elements = InitLinearElements.run(data.blocks)
    }
    const normalizedTree = NormalizeTree.run(elements)

    // saga triggers next_page to process element '0'

    return {
      ...defaultState,
      initialized: true,
      type: data.type || 'preview_assessment',
      isThreesixty: data.isThreesixty,
      dashboardUrl: data.dashboardUrl || '/',
      dataSheetColumns: data.data_sheet_columns,
      relationships: data.relationships,
      relationship: result.relationship,
      isAnonymousAssessment: data.isAnonymousAssessment,
      readOnly: data.readOnly,
      mediaUrl: data.isThreesixty
        ? `/campaigns/${result.campaign_id}/users_results/${result.id}`
        : `/assigns/${result.id}`,
      resultsUrl: data.resultsUrl,
      enableBack: data.enable_back,
      enableProgress: data.enable_progress,
      allPages: InitPages.run(data),
      normalizedTree,
      normRules: data.norm_rules,
      hrisData: result.hris || {},
      elements: data.flow.elements,
      linear: data.flow.elements.length === 0,
      blocks: normalizedData.entities.blocks,
      questions: normalizedData.entities.questions,
      currentElement: result.current_element || null,
      currentPage: result.current_page || 0,
      randomseed: result.id || '', // use assign or user id
      dataSheet: result.data_sheet,
      subjectDataSheet: result.subject_datasheet,
      dbResult: result,
      results: result.results || result.answers || {},
      expiryDate: result.expiry_date,
      timerDuration: data.timer_duration,
      metaData: result.meta_data || {},
    }
  },
  [ANSWER]: (state, { result }) => setIn(state, ['results', result.question_id], result),
  [SHOW_ERRORS]: (state, { errors }) => setIn(state, ['errors'], errors),
  [EMPTY_ERRORS]: state => setIn(state, ['errors'], null),
  [CHANGE_ELEMENT]: (state, { id, page }) => ({ ...state, currentPage: page || 0, currentElement: id }),
  [SHOW_PAGE]: (state, { page }) => ({ ...state, currentPage: page }),
  [ADD_PREV_PAGE]: (state, { page }) => ({ ...state, prevPages: [...state.prevPages, page] }),
  [REMOVE_PREV_PAGE]: state => setIn(state, 'prevPages', _.slice(state.prevPages, 0, -1)),
  [SHOW_END]: state => ({ ...state, end: true }),
  [SET_EMBEDDED_DATA]: (state, { data }) => setIn(state, 'embeddedData', { ...state.embeddedData, ...data }),
  [HIDE_QUESTION]: (state, { id }) => setIn(state, ['questions', id, 'hidden'], true),
  [SHOW_QUESTION]: (state, { id }) => setIn(state, ['questions', id, 'hidden'], false),
  [SET_DIRTY_RESULTS]: (state, { questionIds: ids }) => {
    const results = ids.reduce((results, id) => {
      if (!state.results[id]) { return results }
      return setIn(state.results, [id, 'dirty'], true)
    }, {})
    return {
      ...state,
      results: { ...state.results, ...results },
    }
  },
  [SET_NOT_DIRTY_RESULTS]: (state, { questionIds: ids }) => {
    const results = ids.reduce((results, id) => {
      if (!state.results[id]) { return results }
      return ({ ...results, [id]: _.omit(state.results[id], 'dirty') })
    }, {})
    return {
      ...state,
      results: { ...state.results, ...results },
    }
  },
  [TOGGLE_HIDDEN_QUESTIONS]: state => setIn(state, ['hideHiddenQuestions'], !state.hideHiddenQuestions),
  [TOGGLE_IGNORE_VALIDATION]: state => setIn(state, ['ignoreValidations'], !state.ignoreValidations),
  [RESET]: state => ({
    ...state, results: {}, currentElement: null, current_page: 0,
  }),
  [SAVE_RESULTS]: (state, { response: { expired } }) => ({ ...state, end: expired || state.end }),
  [UPDATE_META_DATA_REQUEST]: (state, { metaData }) => ({ ...state, metaData }),
}

export default createReducer(HANDLERS, defaultState)
