import { connect } from 'react-redux'
import { close } from 'libs/survey/core/modals'
import { addQuestion, createBlock } from 'core/builder/assessment/block/actions'
import { createQuestions } from 'core/builder/assessment/question/actions'
import { selectBlock } from 'libs/survey/core/builder/assessment/selectors'

export default connect(
  ({ survey: { modals, builder } }) => ({
    ...modals.createByTemplate.data,
    block: modals.createByTemplate.data ? selectBlock(builder, modals.createByTemplate.data.blockId) : null,
  }),
  {
    close: () => close('createByTemplate'),
    addQuestion,
    createBlock,
    createQuestions,
  },
)
