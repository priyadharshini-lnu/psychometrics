import { connect } from 'react-redux'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { selectQuestion } from '~/modules/survey/core/builder/assessment/question/selectors'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'

export default connect(
  ({ survey, survey: { builder } }) => ({
    ...getData(survey).defaultValue,
    question: QuestionSerializer.wrap(getData(survey).defaultValue
      ? selectQuestion(builder, getData(survey).defaultValue.model.id)
      : null),
  }),
  {
    close: () => closeModal('defaultValue'),
  },
)
