import { updateIn, setIn } from 'utils/immutable'
import Block from 'models/Block'
import { createReducer } from 'utils/reduxUtils'
import _ from 'lodash'
import { INIT } from '../actions'
import {
  CREATE, ADD_QUESTION, REMOVE_QUESTION, MOVE_QUESTION_UP,
  MOVE_QUESTION_DOWN,
} from './actions'
import { questionsWithoutDeleted } from '../selectors'

const updatePosition = (blocks) => {
  _.sortBy(blocks, ['position'])
  _.each(blocks, (block, position) => {
    block.position = position + 1
  })
}

const filterDeletedQuestions = (block, entities) => questionsWithoutDeleted(entities, block.questions).map(q => q.id)

const createDefault = () => new Block({ name: 'Default Block', position: 0 })

const HANDLERS = {
  [INIT]: (_store, { data }) => {
    if (_.size(data.entities.blocks) > 0) {
      const blocks = _.each(data.entities.blocks, (block) => {
        block.questions = filterDeletedQuestions(block, data.entities)
      })

      return blocks
    }
    return [createDefault()]
  },
  [CREATE]: (state, { data }) => {
    const { blocks } = state
    const newBlocks = _.clone(blocks)
    if (data) {
      _.each(_.slice(newBlocks, data.position - 1), (b) => { b.position += 1 })
      newBlocks.splice(data.position - 1, 0, new Block(data))
    } else {
      newBlocks.push(new Block({ position: newBlocks.length }))
    }
    return { ...state, blocks: newBlocks }
  },
  [ADD_QUESTION]: (state, { block, question }) => {
    const newBlock = _.clone(state[block.id])
    newBlock.questions.push(question.id)

    return setIn(state, [block.id], newBlock)
  },
  [REMOVE_QUESTION]: (state, { block, question }) => {
    const newBlock = _.cloneDeep(state[block.id])
    _.pull(newBlock.questions, question.id)
    return setIn(state, [block.id], newBlock)
  },
  [MOVE_QUESTION_UP]: (state, { block, question, blockOrder }) => {
    const newBlock = _.cloneDeep(state[block.id])
    const index = _.findIndex(block.questions, id => id === question.id)

    if (index > 0) {
      _.pull(newBlock.questions, question.id)
      newBlock.questions.splice(index - 1, 0, question.id)
      return setIn(state, [block.id], newBlock)
    }

    const blockIndex = _.findIndex(blockOrder, id => id === block.id)
    const prevBlockId = blockOrder[blockIndex - 1]

    if (prevBlockId) {
      _.pull(newBlock.questions, question.id)
      const newPrevBlock = _.cloneDeep(state[prevBlockId])
      newPrevBlock.questions.push(question.id)
      const newState = setIn(state, [block.id], newBlock)
      return setIn(newState, [prevBlockId], newPrevBlock)
    }
    return state
  },
  [MOVE_QUESTION_DOWN]: (state, { block, question, blockOrder }) => {
    const newBlock = _.cloneDeep(state[block.id])
    const index = _.findIndex(block.questions, id => id === question.id)

    if (index < block.questions.length - 1) {
      _.pull(newBlock.questions, question.id)
      newBlock.questions.splice(index + 1, 0, question.id)
      return setIn(state, [block.id], newBlock)
    }

    const blockIndex = _.findIndex(blockOrder, id => id === block.id)
    const nextBlockId = blockOrder[blockIndex + 1]

    if (nextBlockId) {
      _.pull(newBlock.questions, question.id)
      const newNextBlock = _.cloneDeep(state[nextBlockId])
      newNextBlock.questions.unshift(question.id)
      const newState = setIn(state, [block.id], newBlock)
      return setIn(newState, [nextBlockId], newNextBlock)
    }
    return state
  },
}

export default createReducer(HANDLERS, [])
