import { connect } from 'react-redux'
import { set as setSelectedTab } from '~/modules/admin/modules/threeSixtyCampaign/core/selectedParticipantTab'

export default connect(
  null,
  { setSelectedTab },
)
