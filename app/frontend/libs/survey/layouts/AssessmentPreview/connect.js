import { connect } from 'react-redux'

export default connect(
  ({ preview }) => ({
    end: preview.end,
    initialized: preview.initialized,
    assessmentCategory: preview.assessmentCategory,
    agileAssignUrl: preview.agileAssignUrl,
    agileAssetsUrl: preview.agileAssetsUrl,
  }),
  {
  },
)
