import { connect } from 'react-redux'
import { getUserEvaluators, update, remove } from '~/modules/admin/modules/threeSixtyCampaign/core/participants'

export default connect(
  state => ({ participants: getUserEvaluators(state), relationships: state.project.relationships }),
  { update, remove },
)
