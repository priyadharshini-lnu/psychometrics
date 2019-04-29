import _ from 'lodash'
import { put } from 'redux-saga/effects'

const SHOW_SPINNER = 'modals/SHOW_SPINNER'
const HIDE_SPINNER = 'modals/HIDE_SPINNER'
export const defaultState = {
  visible: false,
}

export const showSpinner = () => ({ type: SHOW_SPINNER, name })
export const hideSpinner = () => ({ type: HIDE_SPINNER })
export const getSpinnerState = state => _.get(state, ['temp', 'spinner', 'visible'])

export function* genShowSpinner () {
  yield put(showSpinner())
}

export function* genHideSpinner () {
  yield put(hideSpinner())
}

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case SHOW_SPINNER:
      return { ...state, visible: true }
    case HIDE_SPINNER:
      return { ...state, visible: false }
    default:
      return state
  }
}
