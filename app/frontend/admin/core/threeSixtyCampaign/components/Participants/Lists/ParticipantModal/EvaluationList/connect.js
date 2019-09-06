import { connect } from 'react-redux'
import { getUserSubjects, update, remove } from 'admin/core/threeSixtyCampaign/participants'

export default connect(
  state => ({ participants: getUserSubjects(state), relationships: state.project.relationships }),
  { update, remove },
)
