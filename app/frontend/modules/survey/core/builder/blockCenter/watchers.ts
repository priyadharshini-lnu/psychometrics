/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  takeEvery, put,
} from 'redux-saga/effects'
import { normalize } from 'normalizr'
import schema from '~/modules/survey/store/schema'
import { INIT } from '../assessment/actions'
import { SAVE } from './index'

function* genSave ({ response }: any) {
  const normalizedData = normalize({
    id: response.data.id,
    blocks: [response.data],
    factors: {},
    question_recoding: [],
    flow: {},
  }, schema)

  yield put({ type: INIT, data: normalizedData })
}

export const watchers = [
  takeEvery(SAVE, genSave),
]
