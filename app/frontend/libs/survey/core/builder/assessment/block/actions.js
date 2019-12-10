import {
  select, takeEvery, put,
} from 'redux-saga/effects'
import Question from 'models/Question'
import Block from 'models/Block'
import * as questionAction from '../question/actions'
import * as assessmentActions from '../actions'
import { questionsSelector } from '../selectors'

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
export const CLONE_BLOCK = 'builder/assessment/block/CLONE_BLOCK'
export const UPDATE_QUESTION_IDS = 'builder/assessment/block/UPDATE_QUESTION_IDS'
export const RENAME_BLOCK = 'builder/assessment/block/RENAME_BLOCK'
export const PERMANENT_REMOVE = 'builder/assessment/block/PERMANENT_REMOVE'
export const RESTORE_BLOCK = 'builder/assessment/block/RESTORE_BLOCK'
export const RESTORE_QUESTION = 'builder/assessment/block/RESTORE_QUESTION'
export const SAVE_AS_TEMPLATE = 'builder/assessment/block/SAVE_AS_TEMPLATE'
export const UNLINK_TEMPLATE = 'builder/assessment/block/UNLINK_TEMPLATE'

export const createBlock = block => ({ type: CREATE, block })
export const removeBlock = block => ({ type: REMOVE, block })

export const addQuestion = (block, data) => ({
  type: ADD_QUESTION, block, question: new Question({ ...data, block_id: block.id }),
})

export const insertBeforeQuestion = (block, question) => ({
  type: INSERT_BEFORE_QUESTION, block, position: question.position, question: new Question({ block_id: block.id }),
})

export const insertAfterQuestion = (block, question) => ({
  type: INSERT_AFTER_QUESTION, block, position: question.position, question: new Question({ block_id: block.id }),
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

export const renameBlock = (block, name) => ({
  type: RENAME_BLOCK, block, name,
})

export const copyQuestion = (question, newQuestion) => ({
  type: COPY_QUESTION, question, newQuestion,
})

export const cloneBlock = block => ({
  type: CLONE_BLOCK, block,
})

export const updateQuestionIds = (block, ids) => ({
  type: UPDATE_QUESTION_IDS, block, ids,
})

export const permanentRemoveBlock = block => ({
  type: PERMANENT_REMOVE, block,
})

export const restoreBlock = block => ({
  type: RESTORE_BLOCK, block,
})

export const restoreQuestion = question => ({
  type: RESTORE_QUESTION, question,
})

export const saveAsTemplate = block => ({
  type: SAVE_AS_TEMPLATE, block,
})

export const unlinkTemplate = block => ({
  type: UNLINK_TEMPLATE, block,
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

function* genCloneBlock ({ block }) {
  const state = yield select()
  const questions = questionsSelector(state.survey.builder, block.questions)
  const newQuestions = yield questions.map(q => new Question(_.extend({}, q, { id: null })))
  yield put(questionAction.createQuestions(newQuestions))
  yield put(updateQuestionIds(block, _.map(newQuestions, 'id')))
  yield put(updatePositions(state.survey.builder.assessment.blocks))
}

function* genEnsureDefaultBlock () {
  const state = yield select()

  if (!state.survey.builder.assessment.blocks.length) {
    yield put(createBlock(new Block({ name: 'Default Block', position: 0 })))
  }
  yield put(updatePositions(state.survey.builder.assessment.blocks))
}

export const watchers = [
  takeEvery(assessmentActions.INIT, genEnsureDefaultBlock),
  takeEvery(REMOVE, genEnsureDefaultBlock),
  takeEvery(CREATE, genUpdateBlocksPositions),
  takeEvery(RESTORE_BLOCK, genUpdateBlocksPositions),
  takeEvery(CLONE_BLOCK, genCloneBlock),
  takeEvery(assessmentActions.MOVE_BLOCK_DOWN, genUpdateBlocksPositions),
  takeEvery(assessmentActions.MOVE_BLOCK_UP, genUpdateBlocksPositions),

  takeEvery(ADD_QUESTION, genAddQuestion),
  takeEvery(COPY_QUESTION, genCopyQuestion),
  takeEvery(RESTORE_QUESTION, genUpdateQuestionsPositions),
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
