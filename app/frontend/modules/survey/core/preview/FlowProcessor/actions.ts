/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import NormResolver from './commands/NormResolver'
import {
  NEXT_PAGE, PREV_PAGE,
  SHOW_PAGE, SHOW_END, CHANGE_ELEMENT,
  SHOW_ERRORS, EMPTY_ERRORS, SAVE_RESULTS,
  SET_EMBEDDED_DATA, HIDE_QUESTION, ADD_PREV_PAGE,
  REMOVE_PREV_PAGE, SET_DIRTY_RESULTS, SHOW_QUESTION,
  SET_NOT_DIRTY_RESULTS, TOGGLE_HIDDEN_QUESTIONS,
  TOGGLE_IGNORE_VALIDATION, RESET,
  UPDATE_HIGHLIGHT, UPDATE_HIGHLIGHT_REQUEST,
  SET_LOCAL_RESULTS,
  MARK_QUESTION_IN_PROGRESS,
  REMOVE_QUESTION_IN_PROGRESS,
  CLEAR_IN_PROGRESS_QUESTION,
  ADD_QUESTION_ERROR, REMOVE_QUESTION_ERROR,
  MARK_ASSESSMENT_TIMED_OUT,
  ADD_MEDIA_RESPONSE,
  REMOVE_MEDIA_RESPONSE,
  MARK_MEDIA_RESPONSE_AS_SELECTED,
} from './consts'
import {
  NextPage, PrevPage, AddPrevPage, RemovePrevPage,
  ShowErrors, EmptyErrors, ShowPage, ShowEnd,
  ChangeElement, HideQuestion, ShowQuestion, SetEmbeddedData,
  SetDirtyResults, SetNotDirtyResults, ToggleHiddenQuestions,
  ToggleIgnoreValidation, Reset, SetLocalResults, SaveResults,
  Highlight, QuestionError, MediaResponse,
} from './interfaces'
import { getCurrentBlock } from './selectors'

export const nextPage = (params = {}): NextPage => ({ type: NEXT_PAGE, ...params })

export const saveCurrentPage = () => (dispatch, getState) => {
  const { preview } = getState()
  if (preview.type === 'pass_assessment') {
    const currentBlock = getCurrentBlock(preview)
    dispatch(saveResults(preview, [], currentBlock.id))
  }
}

export const prevPage = (preview): PrevPage => {
  if (preview.type !== 'pass_assessment') {
    return { type: PREV_PAGE }
  }
  // TODO (atanych): Is used the same endpoint as for `saveResults` with empty resource to update last_activity_at field
  const url = preview.resultsUrl || `/assigns/${preview.dbResult.id}`

  return {
    type: PREV_PAGE,
    request: {
      url,
      method: 'PUT',
      body: { resource: {} },
    },
  }
}

export const addPrevPage = (page): AddPrevPage => ({ type: ADD_PREV_PAGE, page })

export const removePrevPage = (): RemovePrevPage => ({ type: REMOVE_PREV_PAGE })

export const showErrors = (errors): ShowErrors => ({ type: SHOW_ERRORS, errors })

export const emptyErrors = (): EmptyErrors => ({ type: EMPTY_ERRORS })

export const showPage = (page): ShowPage => ({ type: SHOW_PAGE, page })
export const addQuestionError = (questionId: number, errors: QuestionError[]) => (
  { type: ADD_QUESTION_ERROR, questionId, errors })

export const removeQuestionError = (questionId: number) => ({ type: REMOVE_QUESTION_ERROR, questionId })

export const showEnd = (): ShowEnd => ({ type: SHOW_END })

export const changeElement = (id: string, page?: number): ChangeElement => ({ type: CHANGE_ELEMENT, id, page })

export const hideQuestion = (id: number): HideQuestion => ({ type: HIDE_QUESTION, id })
export const showQuestion = (id: number): ShowQuestion => ({ type: SHOW_QUESTION, id })

export const setEmbeddedData = (data: object): SetEmbeddedData => ({ type: SET_EMBEDDED_DATA, data })

export const setDirtyResults = (questionIds): SetDirtyResults => ({ type: SET_DIRTY_RESULTS, questionIds })
export const setNotDirtyResults = (questionIds): SetNotDirtyResults => ({ type: SET_NOT_DIRTY_RESULTS, questionIds })

export const toggleHiddenQuestions = (): ToggleHiddenQuestions => ({ type: TOGGLE_HIDDEN_QUESTIONS })
export const toggleIgnoreValidation = (): ToggleIgnoreValidation => ({ type: TOGGLE_IGNORE_VALIDATION })
export const reset = (): Reset => ({ type: RESET })
export const setLocalResults = (data: object): SetLocalResults => ({ type: SET_LOCAL_RESULTS, data })

export const markQuestionInProgress = (questionId, progressState) => (
  { type: MARK_QUESTION_IN_PROGRESS, questionId, progressState })
export const removeQuestionInProgress = (questionId, progressState) => (
  { type: REMOVE_QUESTION_IN_PROGRESS, questionId, progressState })
export const clearInProgressQuestion = () => ({ type: CLEAR_IN_PROGRESS_QUESTION })

export const markAssessmentTimedOut = (questionId: number) => ({ type: MARK_ASSESSMENT_TIMED_OUT, questionId })

export const saveResults = (preview, questionIds, currentBlockId?): SaveResults => {
  const answerKey = !preview.resultsUrl || preview.resultsUrl.includes('/assigns/') ? 'results' : 'answers'

  const data = {
    resource: {
      [answerKey]: preview.results,
      current_element: preview.currentElement,
      current_page: preview.currentPage,
      embedded_data: preview.embeddedData,
      status: (preview.end || preview.dbResult.status === 'completed') ? 'completed' : 'in_progress',
      prev_pages: preview.prevPages,
    },
    question_ids: questionIds,
    current_block_id: currentBlockId,
  }
  const url = preview.resultsUrl || `/assigns/${preview.dbResult.id}`
  if (preview.end) {
    const normData = NormResolver.run(preview.normRules, preview.hrisData, preview.questions, preview.results)
    if (preview.isThreesixty) {
      data.resource = { ...data.resource, norm_id: normData.id }
    } else {
      data.resource = { ...data.resource, norm_data: normData }
    }
  }
  return {
    type: SAVE_RESULTS,
    request: {
      url,
      method: 'PUT',
      body: JSON.stringify(data),
      decamelize: false,
    },
  }
}

interface Opts {
  notStored?: boolean
  assessmentId?: number
}

export const updateHighlight = (highlight: Highlight, data: object, opts: Opts = {}) => (dispatch, getState) => {
  const { preview, preview: { dbResult: { assessment_id } } } = getState()

  const payload = {
    id: highlight.id, data, resourceType: highlight.resourceType, resourceId: highlight.resourceId,
  }

  if (preview.type === 'preview_assessment' || opts.notStored) {
    return dispatch({
      type: UPDATE_HIGHLIGHT_REQUEST,
      payload,
    })
  }

  return dispatch({
    type: UPDATE_HIGHLIGHT,
    request: {
      url: `/highlights/${highlight.id}`,
      method: 'PUT',
      body: {
        data,
        resource_type: highlight.resourceType,
        resource_id: highlight.resourceId,
        assessment_id: opts.assessmentId || assessment_id,
      },
      decamelize: false,
    },
    payload,
  })
}

export const addMediaResponse = (mediaResponse: MediaResponse) => ({
  type: ADD_MEDIA_RESPONSE,
  payload: { mediaResponse },
})

export const removeMediaResponse = (questionId: number) => ({
  type: REMOVE_MEDIA_RESPONSE,
  payload: { questionId },
})

export const markMediaResponseAsSelected = (mediaResponse: MediaResponse) => ({
  type: MARK_MEDIA_RESPONSE_AS_SELECTED,
  payload: { mediaResponse },
})
