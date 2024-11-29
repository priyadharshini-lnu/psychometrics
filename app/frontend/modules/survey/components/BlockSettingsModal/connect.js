import { connect } from 'react-redux'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { selectQuestion } from '~/modules/survey/core/builder/assessment/question/selectors'
import { selectBlock } from '~/modules/survey/core/builder/assessment/selectors'
import { updateBlockProps } from '~/modules/survey/core/builder/assessment/block/actions'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'

const getModel = (state, data) => {
  if (data.entityName === 'choice') {
    return QuestionSerializer.wrap(selectQuestion(state, data.id))
  }
  return selectBlock(state, data.id)
}

export default connect(
  ({ survey, survey: { builder } }) => ({
    model: getData(survey).blockSettings && getModel(builder, getData(survey).blockSettings),
  }),
  {
    close: () => closeModal('blockSettings'),
    updateBlockProps,
  },
)
