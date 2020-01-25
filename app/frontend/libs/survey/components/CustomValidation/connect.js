import { connect } from 'react-redux'
import { closeModal, getData } from 'admin/core/temp/modals'
import { selectQuestion } from 'core/builder/assessment/question/selectors'
import QuestionSerializer from 'models/QuestionSerializer'
import { allQuestions } from 'core/builder/assessment/selectors'

export default connect(
  ({ survey, survey: { builder } }) => ({
    ...getData(survey).customValidation,
    questions: allQuestions(builder),
    question: QuestionSerializer.wrap(getData(survey).customValidation
      ? selectQuestion(builder, getData(survey).customValidation.questionId)
      : null),
  }),
  {
    close: () => closeModal('customValidation'),
  },
)
