import { setIn, updateIn } from 'utils/immutable'
import { createReducer } from 'utils/reduxUtils'
import {
  ADD_QUESTION, REMOVE, INSERT_AFTER, INSERT_BEFORE, MOVE_UP, MOVE_DOWN, UPDATE_POSITIONS,
} from './actions'
import {
  REMOVE_QUESTION,
} from '../block/actions'
import { INIT } from '../actions'
import { createQuestion, removeQuestion } from './updaters'
import { questionsWithoutDeleted } from '../selectors'


const HANDLERS = {
  [INIT]: (_, { data }) => (data.entities.questions),
  [ADD_QUESTION]: (state, { question }) => {
    const questions = _.clone(state)
    console.log(question)
    questions[question.id] = question
    return questions
  },
  [REMOVE_QUESTION]: (state, { question }) => {
    const questions = _.clone(state)
    questions[question.id].deleted = true
    return questions
  },

  [UPDATE_POSITIONS]: (state, { block }) => {
    const questions = _.clone(state)
    const blockQuestions = questionsWithoutDeleted({ questions }, block.questions)
    let pos = 1
    _.each(blockQuestions, (q) => {
      q.position = pos
      questions[q.id] = q
      pos += 1
    })
    console.log(questions)
    return questions
  },

  [INSERT_AFTER]: (state, { question }) => {
    const { blocks } = state
    const { block } = question

    const index = _.findIndex(block.questions, question)
    const newQuestion = createQuestion(block)
    newQuestion.position = block.questions[index].position + 1

    const newBlock = _.clone(block)
    const blockIndex = _.findIndex(blocks, block)

    _.each(_.slice(newBlock.questions, index + 1), (q) => { q.position += 1 })
    newBlock.questions.splice(index + 1, 0, newQuestion)

    const newBlocks = setIn(blocks, [blockIndex], newBlock)
    return { ...state, blocks: newBlocks }
  },

  [INSERT_BEFORE]: (state, { question }) => {
    const { blocks } = state
    const { block } = question

    const index = _.findIndex(block.questions, question)
    const newQuestion = createQuestion(block)
    newQuestion.position = block.questions[index].position + 1

    const newBlock = _.clone(block)
    const blockIndex = _.findIndex(blocks, block)

    _.each(_.slice(newBlock.questions, index + 1), (q) => { q.position += 1 })
    newBlock.questions.splice(index, 0, newQuestion)

    const newBlocks = setIn(blocks, [blockIndex], newBlock)
    return { ...state, blocks: newBlocks }
  },
}

export default createReducer(HANDLERS, [])
