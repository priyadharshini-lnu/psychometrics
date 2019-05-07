import { connect } from 'react-redux'
import { getUserSubjects } from 'admin/core/threeSixtyCampaign/participants'

export default connect(
  state => ({ participants: getUserSubjects(state) }),
  {},
)
