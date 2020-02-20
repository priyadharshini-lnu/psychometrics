import { createReducer } from 'utils/reduxUtils'
import { UPLOAD_STATES } from './constants'

export const initialState = {
  file: null,
  uploadState: UPLOAD_STATES.READY,
  errorCodes: [],
  percent: 0,
}

export const SET_UPLOAD_STATE = 'SET_UPLOAD_STATE'
export const SET_FILE = 'SET_FILE'
export const REMOVE_FILE = 'REMOVE_FILE'
export const SET_ERRORS = 'SET_ERROR_CODES'
export const SET_PERCENTAGE = 'SET_PERCENTAGE'

const HANDLERS = {
  [SET_UPLOAD_STATE]: (state, { payload: { uploadState } }) => ({ ...state, uploadState }),
  [SET_FILE]: (state, { payload: { file } }) => ({ ...state, file }),
  [REMOVE_FILE]: state => ({
    ...state, file: null, uploadState: UPLOAD_STATES.READY, errorCodes: [],
  }),
  [SET_ERRORS]: (state, { payload: { errorCodes } }) => ({ ...state, errorCodes, uploadState: UPLOAD_STATES.ERROR }),
  [SET_PERCENTAGE]: (state, { payload: { percent } }) => ({ ...state, percent }),
}

export default createReducer(HANDLERS, {})
