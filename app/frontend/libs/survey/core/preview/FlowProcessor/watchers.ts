/* eslint-disable @typescript-eslint/explicit-function-return-type */
import _ from 'lodash'
import {
  select, takeEvery, put, debounce,
} from 'redux-saga/effects'
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
} from './selectors'
import {
  INIT, SHOW_PAGE, PREV_PAGE, SHOW_END, RESET, CHANGE_ELEMENT, ADD_PREV_PAGE, REMOVE_PREV_PAGE,
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
}

function* genSavePrevPages () {
  const state = yield select()
  if (state.preview.type === 'pass_assessment') {
    const data = state.preview.prevPages
    localStorage.setItem(`prev_${state.preview.dbResult.id}`, JSON.stringify(data))
  }
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
  takeEvery(RESET, genInitPageProcessing),
  takeEvery(PREV_PAGE, genPrevPage),
  takeEvery(SHOW_PAGE, genUpdateResultsAsNotDirty),
  takeEvery(ADD_PREV_PAGE, genSavePrevPages),
  takeEvery(REMOVE_PREV_PAGE, genSavePrevPages),
  debounce(200, [CHANGE_ELEMENT, SHOW_PAGE, SHOW_END], genSaveResults),
]
