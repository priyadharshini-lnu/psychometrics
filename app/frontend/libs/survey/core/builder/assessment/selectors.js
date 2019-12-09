import { block, question } from 'store/schema'
import { createSelector } from 'reselect'
import { denormalize } from 'normalizr'

export const blocksSelector = (state, ids) => denormalize(ids, [block], state)
export const questionsSelector = (state, ids) => denormalize(ids, [question], state)
export const selectBlock = (state, id) => state.blocks[id]

export const blocksWithoutDeleted = createSelector(
  blocksSelector,
  blocks => _.filter(blocks, { deleted: false }),
)

export const questionsWithoutDeleted = createSelector(
  questionsSelector,
  questions => _.filter(questions, { deleted: false }),
)

export const allQuestions = createSelector(
  state => state.questions,
  (questions) => {
    const withoutDeleted = _.filter(questions, { deleted: false })
    return _.zipObject(_.map(withoutDeleted, 'id'), withoutDeleted)
  },
)

export const trashItems = ({ survey: { builder } }) => {
  let items = []
  items = items.concat(_.filter(builder.blocks, { deleted: true }).map(model => ({ type: 'Block', model })))
  items = items.concat(_.filter(builder.questions, { deleted: true }).map(model => ({ type: 'Question', model })))
  return items
}

export const selectedQuestion = (state, id) => state.questions[id]
