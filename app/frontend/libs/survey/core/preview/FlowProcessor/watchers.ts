import {
  select, takeEvery, put,
} from 'redux-saga/effects'
import { nextPage } from './actions'
import { INIT } from './consts'

function* genInitPageProcessing () {
  const state = yield select()
  if (!state.currentElement) {
    yield put(nextPage())
  } else {
    yield put(nextPage({ testDisplayLogic: true }))
  }
}

export const watchers = [
  takeEvery(INIT, genInitPageProcessing),
]
