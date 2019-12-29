import { connect } from 'react-redux'
import { close } from 'libs/survey/core/modals'
import { selectQuestion } from 'core/builder/assessment/question/selectors'
import QuestionSerializer from 'models/QuestionSerializer'

export default connect(
  ({ survey: { modals, builder } }) => ({
    show: modals.preview.show,
    ...modals.preview.data,
    question: QuestionSerializer.wrap(modals.preview.data
      ? selectQuestion(builder, modals.preview.data.question.id)
      : null),
  }),
  {
    close: () => close('preview'),
  },
)
