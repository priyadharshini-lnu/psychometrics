import { connect } from 'react-redux'
import { closeModal, getData } from 'admin/core/temp/modals'
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
  ({ survey, survey: { builder } }) => ({
    ...getData(survey).randomization,
    model: getData(survey).randomization && getModel(builder, getData(survey).randomization),
  }),
  {
    close: () => closeModal('randomization'),
    updateBlockProps,
  },
)
