import { setIn } from 'utils/immutable'
import Block from 'models/Block'
import { createReducer } from 'utils/reduxUtils'
import _ from 'lodash'
import { INIT } from '../actions'
import {
  CREATE, ADD_QUESTION, REMOVE_QUESTION, MOVE_QUESTION_UP,
  MOVE_QUESTION_DOWN, INSERT_BEFORE_QUESTION, INSERT_AFTER_QUESTION,
  UPDATE_POSITIONS, REMOVE, ADD_PAGE_BREAK, UPDATE_BLOCK_PROPS, COPY_QUESTION
} from './actions'
import { questionsWithoutDeleted, blocksWithoutDeleted } from '../selectors'

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
  [CREATE]: (state, { block }) => {
    const newBlocks = _.clone(state)
    newBlocks[block.id] = block
    return newBlocks
  },
  [REMOVE]: (state, { block }) => {
    const newBlocks = _.clone(state)
    const newBlock = _.clone(block)
    newBlock.deleted = true
    newBlocks[block.id] = newBlock
    return newBlocks
  },
  [ADD_QUESTION]: (state, { block, question }) => {
    const newBlock = _.clone(state[block.id])
    newBlock.questions.push(question.id)
    return setIn(state, [block.id], newBlock)
  },
  [INSERT_BEFORE_QUESTION]: (state, { block, position, question }) => {
    const newBlock = _.clone(state[block.id])

    newBlock.questions.splice(position - 1, 0, question.id)
    return setIn(state, [block.id], newBlock)
  },
  [INSERT_AFTER_QUESTION]: (state, { block, position, question }) => {
    const newBlock = _.clone(state[block.id])
    newBlock.questions.splice(position, 0, question.id)
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
  [UPDATE_POSITIONS]: (state, { ids }) => {
    const blocks = _.cloneDeep(state)
    const list = blocksWithoutDeleted({ blocks }, ids)
    let pos = 1
    _.each(list, (b) => {
      b.position = pos
      blocks[b.id] = b
      pos += 1
    })
    return blocks
  },
  [ADD_PAGE_BREAK]: (state, { question, pb }) => {
    const blocks = _.clone(state)
    const block = _.find(blocks, block => _.includes(block.questions, question.id))
    const index = _.findIndex(block.questions, id => id === question.id)
    const newBlock = _.clone(block)
    newBlock.questions.splice(index + 1, 0, pb.id)
    blocks[block.id] = newBlock
    return blocks
  },
  [UPDATE_BLOCK_PROPS]: (state, { block, props }) => setIn(state, [block.id, 'props'], { ...block.props, ...props }),
  [COPY_QUESTION]: (state, { question, newQuestion }) => {
    const blocks = _.clone(state)
    const block = _.find(blocks, block => _.includes(block.questions, question.id))
    const index = _.findIndex(block.questions, id => id === question.id)
    const newBlock = _.clone(block)
    newBlock.questions.splice(index + 1, 0, newQuestion.id)
    blocks[block.id] = newBlock
    return blocks
  }
}

export default createReducer(HANDLERS, [])
