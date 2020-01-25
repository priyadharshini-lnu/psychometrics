import { connect } from 'react-redux'
import { closeModal, getData } from 'admin/core/temp/modals'
import { selectQuestion } from 'core/builder/assessment/question/selectors'
import QuestionSerializer from 'models/QuestionSerializer'

export default connect(
  ({ survey, survey: { builder } }) => ({
    ...getData(survey).preview,
    question: QuestionSerializer.wrap(getData(survey).preview
      ? selectQuestion(builder, getData(survey).preview.question.id)
      : null),
  }),
  {
    close: () => closeModal('preview'),
  },
)
