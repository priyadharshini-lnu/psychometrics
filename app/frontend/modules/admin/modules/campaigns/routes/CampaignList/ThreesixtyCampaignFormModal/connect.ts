import { connect } from 'react-redux'
import { fetchTemplatesAndAssessments } from 'modules/admin/modules/campaigns/core/list/index'
import { fetchByAssessmentId } from 'modules/admin/modules/campaigns/core/factors'

export default connect(
  () => ({
  }),
  {
    fetchTemplatesAndAssessments,
    fetchByAssessmentId,
  },
)
