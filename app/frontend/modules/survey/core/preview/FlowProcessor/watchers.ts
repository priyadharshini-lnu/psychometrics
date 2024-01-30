/* eslint-disable @typescript-eslint/explicit-function-return-type */
import _ from 'lodash'
import {
  select, takeEvery, takeLatest, put, debounce,
} from 'redux-saga/effects'
import { Modal } from 'antd'
import { AnyAction } from 'redux'
import { getItem, setItem } from '~/utils/storage'
import {
  nextPage,
  setDirtyResults,
  changeElement,
  removePrevPage,
  saveResults,
  setNotDirtyResults,
  setLocalResults,
  clearInProgressQuestion,
  hideSubmitPage,
  hideEnd,
  setIsSimulation,
  fetchQuestionScoring,
  backButtonPressed,
  showErrorWarning,
} from './actions'
import {
  getPrevPage,
  pageQuestions,
  pageQuestionsWithoutHidden,
  getCurrentBlock,
  getQuestion,
  isValidCurrentElementAndPage,
  getI18n,
} from './selectors'
import {
  INIT, SHOW_PAGE, PREV_PAGE, SHOW_END, RESET, CHANGE_ELEMENT, SAVE_RESULTS,
  ANSWER, MARK_ASSESSMENT_TIMED_OUT, REMOVE_QUESTION_IN_PROGRESS, SHOW_SUBMIT_PAGE,
} from './consts'
import { InProgressQuestion } from './interfaces'
import { sendMessage } from '~/utils/messageBus'

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

function* genInitPageProcessing () {
  const state = yield select()
  if (state.preview.instructions && !state.preview.started) { return }
  if (state.preview.end) { return }

  if (state.preview.assessmentTimedOut) {
    yield genSimulatePassingAssessment()
    return
  }

  if (!state.preview.currentElement) {
    yield put(nextPage())
  } else if (isValidCurrentElementAndPage(state.preview)) {
    yield put(nextPage({ testDisplayLogic: true }))
  } else {
    yield put(showErrorWarning())
  }
}

function* genPrevPage () {
  // set current page questions results as dirty
  const state = yield select()
  if (state.preview.showSubmitPage) {
    yield put(hideEnd())
    yield put(hideSubmitPage())
  }
  const questions = pageQuestions(state.preview)
  const prev = getPrevPage(state.preview)
  if (prev) {
    yield put(hideSubmitPage())
    yield put(backButtonPressed())
    yield put(setDirtyResults(_.map(questions, 'id')))
    yield put(changeElement(prev.element, prev.page))
    yield put(removePrevPage())
    yield put(clearInProgressQuestion())
  }
}

function* genUpdateResultsAsNotDirty () {
  const state = yield select()
  if (!state.preview.initialized) { return }
  const questions = pageQuestionsWithoutHidden(state.preview)
  yield put(setNotDirtyResults(_.map(questions, 'id')))
}

function* genSaveResults () {
  yield put(clearInProgressQuestion())
  const state = yield select()
  if (state.preview.type === 'pass_assessment') {
    const prevPage = getPrevPage(state.preview)
    const currentBlock = getCurrentBlock(state.preview)
    yield put(saveResults(state.preview, prevPage?.questionIds || [], currentBlock.id))
  }
}

function* genFetchLocalResults () {
  const state = yield select()
  if (state.preview.type === 'pass_assessment') {
    const { preview: { dbResult } } = state
    const resetCount = dbResult.reset_count || 0
    const data = getItem(`result_${dbResult.id}_${resetCount}`, `${dbResult.id}${dbResult.user_id}`)
    if (data) {
      yield put(setLocalResults(data))
    }
  }
}

function* genSaveResultsLocal () {
  const state = yield select()
  if (state.preview.type === 'pass_assessment') {
    const { preview: { results, dbResult } } = state
    const resetCount = dbResult.reset_count || 0
    setItem(`result_${dbResult.id}_${resetCount}`, results, `${dbResult.id}${dbResult.user_id}`, TWENTY_FOUR_HOURS)
  }
}

function* genSaveResultsIfNoVideoQuestionInProgress () {
  const state = yield select()
  const inProgressVideoQuestion = _.find((state.preview.inProgressQuestions as InProgressQuestion[]),
    q => getQuestion(state.preview, q.questionId).type === 'VideoResponse')

  if (state.preview.assessmentTimedOut && !inProgressVideoQuestion) {
    if (state.preview.showSubmitPage) {
      yield put(hideSubmitPage())
      return
    }
    if (!state.preview.end) {
      yield genSimulatePassingAssessment()
    } else {
      yield genSaveResults()
    }
  }
}

function* genSimulatePassingAssessment () {
  yield put(setIsSimulation())
  let state = yield select()
  while (!state.preview.end) {
    yield put(nextPage({ skipValidations: true, ignoreBackBtn: true }))
    state = yield select()
  }
}

function* genPassAssessmentIfTimedOut () {
  const state = yield select()
  if (state.preview.showSubmitPage) {
    yield put(hideSubmitPage())
    return
  }
  if (state.preview.assessmentTimedOut && !state.preview.end) {
    yield genSimulatePassingAssessment()
  }
}

function* genFetchQuestionScoring ({ result: { question_id } }: AnyAction) {
  const state = yield select()
  if (state.preview.showQuestionScoring) {
    yield put(fetchQuestionScoring(state.preview.resultsUrl, question_id, state.preview.results))
  }
}

function* genRestart ({ response }: AnyAction) {
  const state = yield select()
  const I18n = getI18n(state.preview)
  if (response.progress_was_reseted) {
    Modal.info({
      content: I18n.t('frontend.restart_progress'),
      okText: I18n.t('frontend.restart'),
      onOk () {
        window.location.reload()
      },
    })
  }
}

function genFinishedEvent () {
  sendMessage('assessment:finished', 'completed')
}

export const watchers = [
  takeEvery(INIT, genInitPageProcessing),
  takeEvery(INIT, genFetchLocalResults),
  debounce(200, ANSWER, genSaveResultsLocal),
  debounce(200, ANSWER, genFetchQuestionScoring),
  takeEvery(RESET, genInitPageProcessing),
  takeEvery(PREV_PAGE, genPrevPage),
  takeEvery(SAVE_RESULTS, genRestart),
  takeEvery([CHANGE_ELEMENT, SHOW_PAGE, SHOW_END], genUpdateResultsAsNotDirty),
  takeLatest(MARK_ASSESSMENT_TIMED_OUT, genSaveResultsIfNoVideoQuestionInProgress),
  takeLatest(REMOVE_QUESTION_IN_PROGRESS, genPassAssessmentIfTimedOut),
  takeLatest([SHOW_END], genFinishedEvent),
  debounce(200, [CHANGE_ELEMENT, SHOW_PAGE, SHOW_SUBMIT_PAGE, SHOW_END], genSaveResults),
]
