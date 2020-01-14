import { connect } from 'react-redux'
import { close } from 'libs/survey/core/modals'
import { selectQuestion } from 'core/builder/assessment/question/selectors'
import QuestionSerializer from 'models/QuestionSerializer'
import { allQuestions } from 'core/builder/assessment/selectors'

export default connect(
  ({ survey: { modals, builder } }) => ({
    ...modals.customValidation.data,
    questions: allQuestions(builder),
    question: QuestionSerializer.wrap(modals.customValidation.data
      ? selectQuestion(builder, modals.customValidation.data.questionId)
      : null),
  }),
  {
    close: () => close('customValidation'),
  },
)
