import { connect } from 'react-redux'
import { fetchTemplatesAndAssessments } from 'admin/campaigns/core/list/index'
import { fetchByAssessmentId } from 'admin/campaigns/core/factors'

export default connect(
  () => ({
  }),
  {
    fetchTemplatesAndAssessments,
    fetchByAssessmentId,
  },
)
