import { connect } from 'react-redux'
import { set as setSelectedTab } from 'admin/core/threeSixtyCampaign/selectedParticipantTab'

export default connect(
  null,
  { setSelectedTab },
)
