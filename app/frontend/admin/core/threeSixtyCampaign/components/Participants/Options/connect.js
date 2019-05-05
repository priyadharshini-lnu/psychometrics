import { connect } from 'react-redux'
import {
  fetch as fetchParticipantOptions,
  getParticipantOption,
} from 'admin/core/threeSixtyCampaign/participantOptions/actions'
import { getLodingState } from 'admin/core/temp/request'

import { setId as setCurrentCampaignId } from '../../../currentThreeSixtyCampaignId'

export default connect(
  state => ({ options: getParticipantOption(state), loading: getLodingState(state) }),
  {
    fetchParticipantOptions,
    setCurrentCampaignId,
  },
)
