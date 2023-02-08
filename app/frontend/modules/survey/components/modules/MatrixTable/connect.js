import { connect } from 'react-redux'
import { getI18n, getQuestionScoring } from '~/modules/survey/core/preview/FlowProcessor/selectors'

export default connect(({ preview }, { model: { id } }) => ({
  showQuestionScoring: preview.showQuestionScoring,
  factors: preview.factors,
  scores: getQuestionScoring(preview, id),
  I18n: getI18n(preview),
}), {})
