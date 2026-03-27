/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  takeEvery, put,
} from 'redux-saga/effects'
import { normalize } from 'normalizr'
import schema from '~/modules/survey/store/schema'
import { INIT, SAVE } from './actions'

function* genSave ({ response }: any) {
  const data = normalize(response.data, schema)
  yield put({ type: INIT, data })
}

export const watchers = [
  takeEvery(SAVE, genSave),
]
