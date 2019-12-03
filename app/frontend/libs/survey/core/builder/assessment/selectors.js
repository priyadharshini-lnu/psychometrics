import { block, question } from 'store/schema'
import { createSelector } from 'reselect'
import { denormalize } from 'normalizr'

export const blocksSelector = (state, ids) => denormalize(ids, [block], state)
export const questionsSelector = (state, ids) => denormalize(ids, [question], state)

export const blocksWithoutDeleted = createSelector(
  blocksSelector,
  blocks => _.filter(blocks, { deleted: false }),
)

export const questionsWithoutDeleted = createSelector(
  questionsSelector,
  questions => _.filter(questions, { deleted: false }),
)

export const trashItems = ({ survey: { builder } }) => {
  let items = []
  items = items.concat(_.filter(builder.blocks, { deleted: true }).map(model => ({ type: 'block', model })))
  items = items.concat(_.filter(builder.questions, { deleted: true }).map(model => ({ type: 'question', model })))
  return items
}
