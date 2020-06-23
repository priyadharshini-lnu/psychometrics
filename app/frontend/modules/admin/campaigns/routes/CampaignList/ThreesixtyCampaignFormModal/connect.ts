import { connect } from 'react-redux'
import { fetchTemplatesAndAssessments } from 'modules/admin/campaigns/core/list/index'
import { fetchByAssessmentId } from 'modules/admin/campaigns/core/factors'

export default connect(
  () => ({
  }),
  {
    fetchTemplatesAndAssessments,
    fetchByAssessmentId,
  },
)
