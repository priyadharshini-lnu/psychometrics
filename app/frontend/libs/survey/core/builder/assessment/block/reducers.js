import { setIn } from 'utils/immutable'
import { createReducer } from 'utils/reduxUtils'
import _ from 'lodash'
import { INIT, EMPTY_TRASH } from '../actions'
import {
  CREATE, ADD_QUESTION, REMOVE_QUESTION, MOVE_QUESTION_UP,
  MOVE_QUESTION_DOWN, INSERT_BEFORE_QUESTION, INSERT_AFTER_QUESTION,
  UPDATE_POSITIONS, REMOVE, ADD_PAGE_BREAK, UPDATE_BLOCK_PROPS, COPY_QUESTION,
  CLONE_BLOCK, UPDATE_QUESTION_IDS, RENAME_BLOCK, PERMANENT_REMOVE, RESTORE_BLOCK,
  RESTORE_QUESTION, SAVE_AS_TEMPLATE, UNLINK_TEMPLATE,
} from './actions'
import { questionsWithoutDeleted, blocksWithoutDeleted } from '../selectors'

const filterDeletedQuestions = (block, entities) => questionsWithoutDeleted(entities, block.questions).map(q => q.id)

const HANDLERS = {
  [INIT]: (store, { data }) => {
    if (_.size(data.entities.blocks) > 0) {
      const blocks = _.each(data.entities.blocks, (block) => {
        block.questions = filterDeletedQuestions(block, data.entities)
      })

      return blocks
    }
    return store
  },
  [CREATE]: (state, { block }) => setIn(state, [block.id], block),
  [REMOVE]: (state, { block }) => setIn(state, [block.id, 'deleted'], true),
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
  },
  [CLONE_BLOCK]: (state, { block }) => setIn(state, [block.id], block),
  [UPDATE_QUESTION_IDS]: (state, { block, ids }) => setIn(state, [block.id, 'questions'], ids),
  [RENAME_BLOCK]: (state, { block, name }) => setIn(state, [block.id, 'name'], name),
  [PERMANENT_REMOVE]: (state, { block }) => setIn(state, [block.id, 'permanentRemove'], true),
  [RESTORE_BLOCK]: (state, { block }) => setIn(
    state, [block.id], Object.assign({}, block, { deleted: false, deletedAt: null }),
  ),
  [RESTORE_QUESTION]: (state, { question }) => {
    const block = _.cloneDeep(state[question.block_id])
    block.questions.splice(question.position - 1, 0, question.id)
    return setIn(state, [block.id], block)
  },
  [EMPTY_TRASH]: (state) => {
    const blocks = _.cloneDeep(state)
    _.each(blocks, (b) => { if (b.deleted) b.permanentRemove = true })
    return blocks
  },
  [SAVE_AS_TEMPLATE]: (state, { block }) => setIn(state, [block.id, 'save_as_template'], true),
  [UNLINK_TEMPLATE]: (state, { block }) => setIn(
    state, [block.id], Object.assign({}, state[block.id], { save_as_template: false, template_id: null }),
  ),
}

export default createReducer(HANDLERS, {})
