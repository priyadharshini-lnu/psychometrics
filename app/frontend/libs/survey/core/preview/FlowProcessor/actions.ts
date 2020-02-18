
import _ from 'lodash'
import NormResolver from './commands/NormResolver'
import {
  NEXT_PAGE, PREV_PAGE, ANSWER,
  SHOW_PAGE, SHOW_END, CHANGE_ELEMENT,
  SHOW_ERRORS, EMPTY_ERRORS, SAVE_RESULTS,
  SET_EMBEDDED_DATA, HIDE_QUESTION, ADD_PREV_PAGE,
  REMOVE_PREV_PAGE, SET_DIRTY_RESULTS, SHOW_QUESTION,
  SET_NOT_DIRTY_RESULTS,
} from './consts'

export const nextPage = (params = {}) => ({ type: NEXT_PAGE, ...params })

export const prevPage = (params = {}) => ({ type: PREV_PAGE, ...params })

export const addPrevPage = page => ({ type: ADD_PREV_PAGE, page })

export const removePrevPage = () => ({ type: REMOVE_PREV_PAGE })

export const showErrors = errors => ({ type: SHOW_ERRORS, errors })

export const emptyErrors = () => ({ type: EMPTY_ERRORS })

export const showPage = page => ({ type: SHOW_PAGE, page })

export const showEnd = () => ({ type: SHOW_END })

export const changeElement = (id: string, page?: number) => ({ type: CHANGE_ELEMENT, id, page })

export const hideQuestion = id => ({ type: HIDE_QUESTION, id })
export const showQuestion = id => ({ type: SHOW_QUESTION, id })

export const setEmbeddedData = data => ({ type: SET_EMBEDDED_DATA, data })

export const setDirtyResults = questionIds => ({ type: SET_DIRTY_RESULTS, questionIds })
export const setNotDirtyResults = questionIds => ({ type: SET_NOT_DIRTY_RESULTS, questionIds })

export const saveResults = (preview) => {
  const data = {
    resource: {
      [preview.isThreesixty ? 'answers' : 'results']: _.omitBy(preview.results, 'dirty'),
      current_element: preview.currentElement,
      current_page: preview.currentPage,
      embedded_data: preview.embeddedData,
      status: preview.end ? 'completed' : 'in_progress',
    },
  }
  const url = preview.isThreesixty ? preview.resultsUrl : `/assigns/${preview.dbResult.id}`
  if (preview.end) {
    const normData = NormResolver.run(preview.normRules, preview.hrisData, preview.questions, preview.results)
    if (preview.isThreesixty) {
      Object.assign(data.resource, { norm_id: normData.id })
    } else {
      Object.assign(data.resource, { norm_data: normData })
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
