import { connect } from 'react-redux'
import { getI18n } from 'core/preview/FlowProcessor/selectors'

export default connect(
  ({ preview }) => ({
    isAnonymousAssessment: preview.isAnonymousAssessment,
    dashboardUrl: preview.dashboardUrl,
    dbResult: preview.dbResult,
    I18n: getI18n(preview),
    scoring: preview.scoring,
    factors: preview.factors,
    isAssessor: preview.isAssessor,
  }),
  {
  },
)
