import { connect } from 'react-redux'
import {
  fetchParticipantOptions,
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
