import { connect } from 'react-redux'
import { getResults, update, remove } from 'admin/core/threeSixtyCampaign/participants'

export default connect(
  state => ({ participants: getResults(state), relationships: state.project.relationships }),
  { update, remove },
)
