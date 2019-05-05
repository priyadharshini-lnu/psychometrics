import _ from 'lodash'
import { put } from 'redux-saga/effects'

const SET_DATASHEET = 'threeSixty/datasheet/SET_DATASHEET'

export const get = state => _.get(state, ['project', 'datasheetFields'])

export function* set ({ response: { datasheetFields } }) {
  yield put({ type: SET_DATASHEET, payload: { datasheetFields } })
}

const defaultState = []
export default function reducer (state = defaultState, { type, payload }) {
  switch (type) {
    case SET_DATASHEET:
      return payload.datasheetFields
    default:
      return state
  }
}
