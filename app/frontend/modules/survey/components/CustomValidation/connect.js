import { connect } from 'react-redux'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { selectQuestion } from '~/modules/survey/core/builder/assessment/question/selectors'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import { allQuestions } from '~/modules/survey/core/builder/assessment/selectors'

export default connect(
  ({ survey, survey: { builder } }) => {
    const urlParams = new URLSearchParams(window.location.search)
    const currentLocale = urlParams.get('assessmentLang') || 'en'
    const { defaultLanguage } = builder?.assessment || {}

    return {
      ...getData(survey).customValidation,
      questions: allQuestions(builder),
      question: QuestionSerializer.wrap(getData(survey).customValidation
        ? selectQuestion(builder, getData(survey).customValidation.questionId)
        : null),
      currentLocale,
      defaultLanguage,
      allowEditConditions: defaultLanguage === currentLocale,
    }
  },
  {
    close: () => closeModal('customValidation'),
  },
)
