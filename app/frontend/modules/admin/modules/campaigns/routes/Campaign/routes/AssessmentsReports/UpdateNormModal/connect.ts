import { connect } from 'react-redux'
import { fetchNorms, updateNorm } from 'modules/admin/modules/campaigns/core/assessments/actions'
import { getSingle } from 'modules/admin/modules/campaigns/core/assessments'

export default connect(
  (state, props) => ({
    assessment: getSingle(state, props.campaignAssessmentId),
  }),
  {
    fetchNorms,
    updateNorm,
  },
)
