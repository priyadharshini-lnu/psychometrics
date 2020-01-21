import {
  select, takeEvery, put,
} from 'redux-saga/effects'
import Question from 'models/Question'
import Block from 'models/Block'
import * as questionAction from '../question/actions'
import * as assessmentActions from '../actions'
import { questionsSelector } from '../selectors'
import {
  REMOVE, CREATE, RESTORE_BLOCK, CLONE_BLOCK,
  ADD_QUESTION, COPY_QUESTION, RESTORE_QUESTION, MOVE_QUESTION_UP,
  MOVE_QUESTION_DOWN, REMOVE_QUESTION, ADD_PAGE_BREAK,
  INSERT_BEFORE_QUESTION, INSERT_AFTER_QUESTION,
  updatePositions, updateQuestionIds, createBlock,
} from './actions'

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
