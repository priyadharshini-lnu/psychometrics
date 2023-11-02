import { connect } from 'react-redux'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { selectQuestion } from '~/modules/survey/core/builder/assessment/question/selectors'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'

export default connect(
  ({ preview, survey, survey: { builder } }) => {
    const data = getData(survey).defaultValue
    const { model: question } = data

    return ({
      ...getData(survey).defaultValue,
      question: QuestionSerializer.wrap(data ? selectQuestion(builder, question.id) : null,
        preview.results[question.id]?.answers || question.props.defaultValues || []),
    })
  },
  {
    close: () => closeModal('defaultValue'),
  },
)
