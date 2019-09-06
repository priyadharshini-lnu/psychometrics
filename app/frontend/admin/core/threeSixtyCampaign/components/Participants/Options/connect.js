import { connect } from 'react-redux'
import {
  fetch as fetchParticipantOptions,
} from 'admin/core/threeSixtyCampaign/participantOptions/actions'
import { getLodingState } from 'admin/core/temp/request'

export default connect(
  state => ({ loading: getLodingState(state) }),
  {
    fetchParticipantOptions,
  },
)
