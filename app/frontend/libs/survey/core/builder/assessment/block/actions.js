import {
  select, takeEvery, put,
} from 'redux-saga/effects'
import Question from 'models/Question'
import * as questionAction from '../question/actions'

export const CREATE = 'builder/assessment/block/CREATE'
export const REMOVE = 'builder/assessment/block/REMOVE'
export const RESTORE = 'builder/assessment/block/RESTORE'
export const MOVE_DOWN = 'builder/assessment/block/MOVE_DOWN'
export const MOVE_UP = 'builder/assessment/block/MOVE_UP'
export const ADD_QUESTION = 'builder/assessment/block/ADD_QUESTION'
export const REMOVE_QUESTION = 'builder/assessment/block/REMOVE_QUESTION'
export const MOVE_QUESTION_UP = 'builder/assessment/block/MOVE_QUESTION_UP'
export const MOVE_QUESTION_DOWN = 'builder/assessment/block/MOVE_QUESTION_DOWN'

export const createBlock = data => ({ type: CREATE, data })
export const addQuestion = (block, data) => ({ type: ADD_QUESTION, block, question: new Question(data) })
export const removeQuestion = (block, question) => ({ type: REMOVE_QUESTION, block, question })

export const moveQuestionUp = (question, block, blockOrder) => ({
  type: MOVE_QUESTION_UP, block, question, blockOrder,
})
export const moveQuestionDown = (question, block, blockOrder) => ({
  type: MOVE_QUESTION_DOWN, block, question, blockOrder,
})

function* genAddQuestion ({ question, block }) {
  yield put(questionAction.createQuestion(question))
  yield put(questionAction.updatePositions(block))
}

function* genUpdateQuestionsPositions ({ question, block }) {
  const state = yield select()
  yield put(questionAction.updatePositions(block))
  const newBlock = _.find(state.survey.builder.blocks, block => _.includes(block.questions, question.id))
  if (newBlock) {
    yield put(questionAction.updatePositions(newBlock))
  }
}

export const watchers = [
  takeEvery(ADD_QUESTION, genAddQuestion),
  takeEvery(MOVE_QUESTION_UP, genUpdateQuestionsPositions),
  takeEvery(MOVE_QUESTION_DOWN, genUpdateQuestionsPositions),
  takeEvery(REMOVE_QUESTION, genUpdateQuestionsPositions),
]
