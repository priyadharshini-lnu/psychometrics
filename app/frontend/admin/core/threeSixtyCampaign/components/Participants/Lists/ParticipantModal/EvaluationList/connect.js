import { connect } from 'react-redux'
import { getUserSubjects, update, destroy } from 'admin/core/threeSixtyCampaign/participants'

export default connect(
  state => ({ participants: getUserSubjects(state), relationships: state.project.relationships }),
  { update, destroy },
)
