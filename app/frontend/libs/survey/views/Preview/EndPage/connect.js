import { connect } from 'react-redux'

export default connect(
  ({ preview }) => ({
    isAnonymousAssessment: preview.isAnonymousAssessment,
    dashboardUrl: preview.dashboardUrl,
    dbResult: preview.dbResult,
  }),
  {
  },
)
