/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  select, takeEvery, put,
} from 'redux-saga/effects'
import { normalize, denormalize } from 'normalizr'
import schema from 'libs/survey/store/schema'
import { INIT, SAVE } from './actions'

function* genSave ({ response }: any) {
  const data = normalize(response.data, schema)
  yield put({ type: INIT, data })
}

export const watchers = [
  takeEvery(SAVE, genSave),
]
