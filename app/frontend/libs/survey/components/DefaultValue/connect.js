import { connect } from 'react-redux'
import { close } from 'libs/survey/core/modals'
import { selectQuestion } from 'core/builder/assessment/question/selectors'
import QuestionSerializer from 'models/QuestionSerializer'

export default connect(
  ({ survey: { modals, builder } }) => ({
    ...modals.defaultValue.data,
    question: QuestionSerializer.wrap(modals.defaultValue.data
      ? selectQuestion(builder, modals.defaultValue.data.model.id)
      : null),
  }),
  {
    close: () => close('defaultValue'),
  },
)
