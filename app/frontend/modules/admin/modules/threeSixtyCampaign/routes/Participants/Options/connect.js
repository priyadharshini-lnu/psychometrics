import { connect } from 'react-redux'
import {
  fetch as fetchParticipantOptions,
} from 'modules/admin/modules/threeSixtyCampaign/core/participantOptions/actions'
import { getLoadingState } from 'modules/admin/core/request'

export default connect(
  state => ({ loading: getLoadingState(state) }),
  {
    fetchParticipantOptions,
  },
)
