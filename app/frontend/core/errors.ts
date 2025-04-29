import _ from 'lodash'
import { createReducer } from '~/utils/redux'

export const ERROR = 'request/ERROR'
export const CLEAR_ERROR = 'request/CLEAR_ERROR'

export type ClientErrorStatus = '401' | '403'

export type RequestError = {
  name: string
  statusCode: ClientErrorStatus
}

export const getRequestErrors = state => ({
  errors: _.get(state, ['errors']),
})

export const setRequestErrors = (name: string, statusCode: ClientErrorStatus) => ({
  type: ERROR,
  payload: { name, statusCode },
})

export const clearRequestErrors = () => ({ type: CLEAR_ERROR })

export const defaultState = { errors: [] }

const HANDLERS = {
  [ERROR]: (state, action) => {
    const errorAlreadyExists = state.errors.find(
      (request: RequestError) => request.name === action.payload.name
      && request.statusCode === action.payload.statusCode,
    )
    if (errorAlreadyExists) {
      return state
    }
    const newErrors: RequestError[] = state.errors.filter(
      (request: RequestError) => request.name !== action.payload.name,
    )
    newErrors.push({ name: action.payload.name, statusCode: action.payload.statusCode })
    return { errors: newErrors }
  },
  [CLEAR_ERROR]: () => ({ errors: [] }),
}

export default createReducer(HANDLERS, defaultState)
