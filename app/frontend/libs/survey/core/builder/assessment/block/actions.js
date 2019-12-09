import {
  select, takeEvery, put,
} from 'redux-saga/effects'
import Question from 'models/Question'
import * as questionAction from '../question/actions'
import * as assessmentActions from '../actions'

export const CREATE = 'builder/assessment/block/CREATE'
export const UPDATE_POSITIONS = 'builder/assessment/block/UPDATE_POSITIONS'
export const REMOVE = 'builder/assessment/block/REMOVE'
export const RESTORE = 'builder/assessment/block/RESTORE'
export const MOVE_DOWN = 'builder/assessment/block/MOVE_DOWN'
export const MOVE_UP = 'builder/assessment/block/MOVE_UP'
export const ADD_QUESTION = 'builder/assessment/block/ADD_QUESTION'
export const INSERT_BEFORE_QUESTION = 'builder/assessment/block/INSERT_BEFORE_QUESTION'
export const INSERT_AFTER_QUESTION = 'builder/assessment/block/INSERT_AFTER_QUESTION'
export const REMOVE_QUESTION = 'builder/assessment/block/REMOVE_QUESTION'
export const MOVE_QUESTION_UP = 'builder/assessment/block/MOVE_QUESTION_UP'
export const MOVE_QUESTION_DOWN = 'builder/assessment/block/MOVE_QUESTION_DOWN'
export const ADD_PAGE_BREAK = 'builder/assessment/block/ADD_PAGE_BREAK'
export const UPDATE_BLOCK_PROPS = 'builder/assessment/block/UPDATE_BLOCK_PROPS'
export const COPY_QUESTION = 'builder/assessment/block/COPY_QUESTION'


export const createBlock = block => ({ type: CREATE, block })
export const removeBlock = block => ({ type: REMOVE, block })
export const addQuestion = (block, data) => ({ type: ADD_QUESTION, block, question: new Question(data) })

export const insertBeforeQuestion = (block, question) => ({
  type: INSERT_BEFORE_QUESTION, block, position: question.position, question: new Question(),
})

export const insertAfterQuestion = (block, question) => ({
  type: INSERT_AFTER_QUESTION, block, position: question.position, question: new Question(),
})

export const removeQuestion = (block, question) => ({
  type: REMOVE_QUESTION, block, question,
})

export const moveQuestionUp = (question, block, blockOrder) => ({
  type: MOVE_QUESTION_UP, block, question, blockOrder,
})

export const moveQuestionDown = (question, block, blockOrder) => ({
  type: MOVE_QUESTION_DOWN, block, question, blockOrder,
})

export const updatePositions = ids => ({
  type: UPDATE_POSITIONS, ids,
})

export const addPageBreak = (question, pb) => ({
  type: ADD_PAGE_BREAK, question, pb,
})

export const updateBlockProps = (block, props) => ({
  type: UPDATE_BLOCK_PROPS, block, props,
})

export const copyQuestion = (question, newQuestion) => ({
  type: COPY_QUESTION, question, newQuestion
})

function* genUpdateBlocksPositions () {
  const state = yield select()
  yield put(updatePositions(state.survey.builder.assessment.blocks))
}

function* genAddQuestion ({ question, block }) {
  yield put(questionAction.createQuestion(question))
  yield put(questionAction.updatePositions(block))
}

function* genCopyQuestion ({ question, newQuestion }) {
  yield put(questionAction.createQuestion(newQuestion))
  const state = yield select()
  const block = _.find(state.survey.builder.blocks, block => _.includes(block.questions, question.id))
  yield put(questionAction.updatePositions(block))
}

function* genUnselectQuestion () {
  yield put(assessmentActions.unselectQuestion())
}

function* genUpdateQuestionsPositions ({ question, block }) {
  const state = yield select()
  if (block) {
    yield put(questionAction.updatePositions(block))
  }
  const newBlock = _.find(state.survey.builder.blocks, block => _.includes(block.questions, question.id))
  if (newBlock) {
    yield put(questionAction.updatePositions(newBlock))
  }
}

export const watchers = [
  takeEvery(CREATE, genUpdateBlocksPositions),
  takeEvery(REMOVE, genUpdateBlocksPositions),
  takeEvery(assessmentActions.MOVE_BLOCK_DOWN, genUpdateBlocksPositions),
  takeEvery(assessmentActions.MOVE_BLOCK_UP, genUpdateBlocksPositions),

  takeEvery(ADD_QUESTION, genAddQuestion),
  takeEvery(COPY_QUESTION, genCopyQuestion),
  takeEvery(MOVE_QUESTION_UP, genUpdateQuestionsPositions),
  takeEvery(MOVE_QUESTION_DOWN, genUpdateQuestionsPositions),
  takeEvery(REMOVE_QUESTION, genUpdateQuestionsPositions),
  takeEvery(ADD_PAGE_BREAK, genUpdateQuestionsPositions),

  takeEvery(REMOVE_QUESTION, genUnselectQuestion),
  takeEvery(MOVE_QUESTION_UP, genUnselectQuestion),
  takeEvery(MOVE_QUESTION_DOWN, genUnselectQuestion),

  takeEvery(INSERT_BEFORE_QUESTION, genAddQuestion),
  takeEvery(INSERT_AFTER_QUESTION, genAddQuestion),
]
