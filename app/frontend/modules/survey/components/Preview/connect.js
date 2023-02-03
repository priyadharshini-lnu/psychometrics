import { connect } from 'react-redux'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { selectQuestion } from '~/modules/survey/core/builder/assessment/question/selectors'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'

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
