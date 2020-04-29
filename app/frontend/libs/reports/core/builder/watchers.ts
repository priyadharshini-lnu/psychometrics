/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  select, takeEvery, put,
} from 'redux-saga/effects'
import PageModel from 'libs/reports/models/Page'
import {
  INIT,
  addPage,
} from './actions'

function* genInitDefaultPage () {
  const state = yield select()
  if (!state.report.builder.pages.length) {
    const page = new PageModel({ position: 1 })
    yield put(addPage(page, 0))
  }
}

export const watchers = [
  takeEvery(INIT, genInitDefaultPage),
]
