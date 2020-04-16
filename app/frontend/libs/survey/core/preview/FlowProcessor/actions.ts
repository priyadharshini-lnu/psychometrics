/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { setIn } from 'utils/immutable'
import _ from 'lodash'
import { getCurrentBlock } from './selectors'
import NormResolver from './commands/NormResolver'
import {
  NEXT_PAGE, PREV_PAGE,
  SHOW_PAGE, SHOW_END, CHANGE_ELEMENT,
  SHOW_ERRORS, EMPTY_ERRORS, SAVE_RESULTS,
  SET_EMBEDDED_DATA, HIDE_QUESTION, ADD_PREV_PAGE,
  REMOVE_PREV_PAGE, SET_DIRTY_RESULTS, SHOW_QUESTION,
  SET_NOT_DIRTY_RESULTS, TOGGLE_HIDDEN_QUESTIONS,
  TOGGLE_IGNORE_VALIDATION, RESET,
  UPDATE_META_DATA, UPDATE_META_DATA_REQUEST,
  SET_LOCAL_RESULTS,
} from './consts'

export const nextPage = (params = {}) => ({ type: NEXT_PAGE, ...params })

export const prevPage = (preview) => {
  // TODO (atanych): Is used the same endpoint as for `saveResults` with empty resource to update last_activity_at field
  const url = preview.isThreesixty ? preview.resultsUrl : `/assigns/${preview.dbResult.id}`

  return {
    type: PREV_PAGE,
    request: {
      url,
      method: 'PUT',
      body: { resource: {} },
    },
  }
}

export const addPrevPage = page => ({ type: ADD_PREV_PAGE, page })

export const removePrevPage = () => ({ type: REMOVE_PREV_PAGE })

export const showErrors = errors => ({ type: SHOW_ERRORS, errors })

export const emptyErrors = () => ({ type: EMPTY_ERRORS })

export const showPage = page => ({ type: SHOW_PAGE, page })

export const showEnd = () => ({ type: SHOW_END })

export const changeElement = (id: string, page?: number) => ({ type: CHANGE_ELEMENT, id, page })

export const hideQuestion = (id: number) => ({ type: HIDE_QUESTION, id })
export const showQuestion = (id: number) => ({ type: SHOW_QUESTION, id })

export const setEmbeddedData = (data: object) => ({ type: SET_EMBEDDED_DATA, data })

export const setDirtyResults = questionIds => ({ type: SET_DIRTY_RESULTS, questionIds })
export const setNotDirtyResults = questionIds => ({ type: SET_NOT_DIRTY_RESULTS, questionIds })

export const toggleHiddenQuestions = () => ({ type: TOGGLE_HIDDEN_QUESTIONS })
export const toggleIgnoreValidation = () => ({ type: TOGGLE_IGNORE_VALIDATION })
export const reset = () => ({ type: RESET })
export const setLocalResults = (data: object) => ({ type: SET_LOCAL_RESULTS, data })

export const saveResults = (preview, questionIds) => {
  const data = {
    resource: {
      [preview.isThreesixty ? 'answers' : 'results']: _.omitBy(preview.results, 'dirty'),
      current_element: preview.currentElement,
      current_page: preview.currentPage,
      embedded_data: preview.embeddedData,
      status: (preview.end || preview.dbResult.status === 'completed') ? 'completed' : 'in_progress',
    },
    question_ids: questionIds,
  }
  const url = preview.isThreesixty ? preview.resultsUrl : `/assigns/${preview.dbResult.id}`
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

export const updateMetaData = (preview, key, data) => {
  const block = getCurrentBlock(preview)
  const metaData = setIn(preview.metaData, [block.id, key], data)

  if (preview.type === 'preview_assessment') return { type: UPDATE_META_DATA_REQUEST, metaData }

  const url = preview.isThreesixty
    ? `${preview.resultsUrl}/update_meta_data`
    : `/assigns/${preview.dbResult.id}/update_meta_data`

  return {
    type: UPDATE_META_DATA,
    request: {
      url,
      method: 'PUT',
      body: { meta_data: metaData },
      decamelize: false,
    },
    metaData,
  }
}
