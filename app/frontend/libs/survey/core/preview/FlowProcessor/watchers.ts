/* eslint-disable @typescript-eslint/explicit-function-return-type */
import _ from 'lodash'
import {
  select, takeEvery, put, debounce,
} from 'redux-saga/effects'
import { getItem, setItem } from 'utils/storage'
import {
  nextPage,
  setDirtyResults,
  changeElement,
  removePrevPage,
  saveResults,
  setNotDirtyResults,
  setLocalResults,
} from './actions'
import {
  getPrevPage,
  pageQuestions,
  pageQuestionsWithoutHidden,
} from './selectors'
import {
  INIT, SHOW_PAGE, PREV_PAGE, SHOW_END, RESET, CHANGE_ELEMENT, ADD_PREV_PAGE,
  REMOVE_PREV_PAGE, ANSWER,
} from './consts'

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

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

function* genFetchLocalResults () {
  const state = yield select()
  if (state.preview.type === 'pass_assessment') {
    const { preview: { dbResult } } = state
    const data = getItem(`result_${dbResult.id}`, `${dbResult.id}${dbResult.user_id}`)
    if (data) {
      yield put(setLocalResults(data))
    }
  }
}

function* genSaveResultsLocal () {
  const state = yield select()
  if (state.preview.type === 'pass_assessment') {
    const { preview: { results, dbResult } } = state
    setItem(`result_${dbResult.id}`, results, `${dbResult.id}${dbResult.user_id}`, TWENTY_FOUR_HOURS)
  }
}

export const watchers = [
  takeEvery(INIT, genInitPageProcessing),
  takeEvery(INIT, genFetchLocalResults),
  debounce(200, ANSWER, genSaveResultsLocal),
  takeEvery(RESET, genInitPageProcessing),
  takeEvery(PREV_PAGE, genPrevPage),
  takeEvery(SHOW_PAGE, genUpdateResultsAsNotDirty),
  takeEvery(ADD_PREV_PAGE, genSavePrevPages),
  takeEvery(REMOVE_PREV_PAGE, genSavePrevPages),
  debounce(200, [CHANGE_ELEMENT, SHOW_PAGE, SHOW_END], genSaveResults),
]
