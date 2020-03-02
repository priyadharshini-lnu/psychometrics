/* eslint-disable @typescript-eslint/explicit-function-return-type */
import _ from 'lodash'
import { select, takeEvery, put } from 'redux-saga/effects'
import {
  nextPage,
  setDirtyResults,
  changeElement,
  removePrevPage,
  saveResults,
  setNotDirtyResults,
} from './actions'
import {
  getPrevPage,
  pageQuestions,
  pageQuestionsWithoutHidden,
  getCurrentPage,
} from './selectors'
import {
  INIT, SHOW_PAGE, PREV_PAGE, SHOW_END, CHANGE_ELEMENT,
} from './consts'

function* genInitPageProcessing () {
  const state = yield select()
  if (!state.preview.currentElement) {
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

function* genUpdateResultsAsNotDirty () {
  const state = yield select()
  const questions = pageQuestionsWithoutHidden(state.preview)
  yield put(setNotDirtyResults(_.map(questions, 'id')))
}

function* genSaveResults () {
  const state = yield select()
  if (state.preview.type === 'pass_assessment') {
    const prevPage = getPrevPage(state.preview)
    yield put(saveResults(state.preview, prevPage?.questionIds || []))
  }
}

export const watchers = [
  takeEvery(INIT, genInitPageProcessing),
  takeEvery(PREV_PAGE, genPrevPage),
  takeEvery(SHOW_PAGE, genSaveResults),
  takeEvery(CHANGE_ELEMENT, genSaveResults),
  takeEvery(SHOW_PAGE, genUpdateResultsAsNotDirty),
  takeEvery(SHOW_END, genSaveResults),
]
