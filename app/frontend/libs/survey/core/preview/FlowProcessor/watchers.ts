import _ from 'lodash'
import {
  select, takeEvery, put,
} from 'redux-saga/effects'
import {
  nextPage, setDirtyResults, changeElement, removePrevPage, showQuestion,
} from './actions'
import { getPrevPage, pageQuestions } from './selectors'
import { INIT, PREV_PAGE } from './consts'

function* genInitPageProcessing () {
  const state = yield select()
  if (!state.currentElement) {
    yield put(nextPage())
  } else {
    yield put(nextPage({ testDisplayLogic: true }))
  }
}

function* genPrevPage () {
  // set current page questions results as dirty
  const state = yield select()
  const questions = pageQuestions(state.preview)
  yield put(setDirtyResults(_.map(questions, 'id')))
  const prev = getPrevPage(state.preview)
  yield put(changeElement(prev.element, prev.page))
  yield put(removePrevPage())
  // update localStorage ???
}

export const watchers = [
  takeEvery(INIT, genInitPageProcessing),
  takeEvery(PREV_PAGE, genPrevPage),
]
