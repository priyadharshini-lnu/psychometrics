import { connect } from 'react-redux'
import {
  fetch as fetchParticipantOptions,
} from 'modules/admin/modules/threeSixtyCampaign/core/participantOptions/actions'
import { getLodingState } from 'modules/admin/core/temp/request'

export default connect(
  state => ({ loading: getLodingState(state) }),
  {
    fetchParticipantOptions,
  },
)
