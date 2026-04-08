import {
  select, takeEvery, put,
} from 'redux-saga/effects'
import PageModel from '~/modules/reports/models/Page'
import {
  INIT,
  UPDATE_PAGE_POSITIONS,
  ADD_PAGE,
  addPage,
  setPagePositions,
} from './actions'

function* genInitDefaultPage () {
  const state = yield select()
  if (!state.report.builder.pages.length) {
    const page = new PageModel({ position: 1 })
    yield put(addPage(page, 0))
  }
}

function* genSetPagePositions () {
  const { report: { builder } } = yield select()
  yield put(setPagePositions(builder.pages))
}

export const watchers = [
  takeEvery(INIT, genInitDefaultPage),
  takeEvery(ADD_PAGE, genSetPagePositions),
  takeEvery(UPDATE_PAGE_POSITIONS, genSetPagePositions),
]
