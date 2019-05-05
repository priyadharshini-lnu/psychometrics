import { connect } from 'react-redux'
import { getUserEvaluators, update, destroy } from 'admin/core/threeSixtyCampaign/participants'

export default connect(
  state => ({ participants: getUserEvaluators(state), relationships: state.threeSixtyCampaign.relationships }),
  { update, destroy },
)
