import { connect } from 'react-redux'
import { closeModal, getData } from 'admin/core/temp/modals'
import { selectQuestion } from 'core/builder/assessment/question/selectors'
import QuestionSerializer from 'models/QuestionSerializer'

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
