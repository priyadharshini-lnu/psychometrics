import { connect } from 'react-redux'
import { getUserEvaluators } from 'admin/core/threeSixtyCampaign/participants'

export default connect(
  state => ({ participants: getUserEvaluators(state) }),
  {},
)
