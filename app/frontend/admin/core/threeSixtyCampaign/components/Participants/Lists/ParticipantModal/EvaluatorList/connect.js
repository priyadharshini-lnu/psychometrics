import { connect } from 'react-redux'
import { getUserEvaluators, update, remove } from 'admin/core/threeSixtyCampaign/participants'

export default connect(
  state => ({ participants: getUserEvaluators(state), relationships: state.project.relationships }),
  { update, remove },
)
