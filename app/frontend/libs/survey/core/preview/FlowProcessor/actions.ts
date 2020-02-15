export const INIT = 'flow_processor/INIT'
export const NEXT_PAGE = 'flow_processor/NEXT_PAGE'
export const PREV_PAGE = 'flow_processor/PREV_PAGE'
export const ANSWER = 'flow_processor/ANSWER'
export const SHOW_PAGE = 'flow_processor/SHOW_PAGE'
export const SHOW_END = 'flow_processor/SHOW_END'
export const CHANGE_ELEMENT = 'flow_processor/CHANGE_ELEMENT'
export const SHOW_ERRORS = 'flow_processor/SHOW_ERRORS'
export const EMPTY_ERRORS = 'flow_processor/EMPTY_ERRORS'
export const SAVE_RESULTS = 'flow_processor/SAVE_RESULTS'
export const SET_EMBEDED_DATA = 'flow_processor/SET_EMBEDED_DATA'
export const HIDE_QUESTION = 'flow_processor/HIDE_QUESTION'

export const nextPage = (params = {}) => ({ type: NEXT_PAGE, ...params })

export const showErrors = errors => ({ type: SHOW_ERRORS, errors })

export const emptyErrors = () => ({ type: EMPTY_ERRORS })

export const showPage = page => ({ type: SHOW_PAGE, page })

export const showEnd = () => ({ type: SHOW_END })

export const changeElement = (id: string) => ({ type: CHANGE_ELEMENT, id })

export const hideQuestion = id => ({ type: HIDE_QUESTION, id })

export const setEmbededData = data => ({ type: SET_EMBEDED_DATA, data })

export const saveResults = (preview) => {
  const data = {
    resource: {
      [preview.isThreesixty ? 'answers' : 'results']: preview.results,
      embedded_data: preview.embeddedData,
      status: preview.end ? 'completed' : 'in_progress',
    },
  }
  const url = preview.isThreesixty ? preview.resultsUrl : `/assigns/${preview.dbResult.id}`
  if (preview.isEnd) {
    // const normData = this.mapNorms()
    // if (preview.isThreesixty) {
    //   Object.assign(data.resource, { norm_id: normData.id })
    // } else {
    //   Object.assign(data.resource, { norm_data: normData })
    // }
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
