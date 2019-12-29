import { connect } from 'react-redux'
import { close } from 'libs/survey/core/modals'
import { selectQuestion } from 'core/builder/assessment/question/selectors'
import { selectBlock } from 'core/builder/assessment/selectors'
import { updateBlockProps } from 'core/builder/assessment/block/actions'
import QuestionSerializer from 'models/QuestionSerializer'

const getModel = (state, data) => {
  if (data.entityName === 'choice') {
    return QuestionSerializer.wrap(selectQuestion(state, data.id))
  }
  return selectBlock(state, data.id)
}

export default connect(
  ({ survey: { modals, builder } }) => ({
    show: modals.randomization.show,
    ...modals.randomization.data,
    model: modals.randomization.data && getModel(builder, modals.randomization.data),
  }),
  {
    close: () => close('randomization'),
    updateBlockProps,
  },
)
