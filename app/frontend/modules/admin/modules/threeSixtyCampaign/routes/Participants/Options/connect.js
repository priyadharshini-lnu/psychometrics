import { connect } from 'react-redux'
import {
  fetch as fetchParticipantOptions,
} from 'modules/admin/modules/threeSixtyCampaign/core/participantOptions/actions'

export default connect(
  null,
  {
    fetchParticipantOptions,
  },
)
