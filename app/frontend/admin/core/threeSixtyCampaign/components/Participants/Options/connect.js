import { connect } from 'react-redux'
import {
  fetchParticipantOptions,
  getParticipantOption,
} from 'admin/core/threeSixtyCampaign/participantOptions/actions'
import { setId as setCurrentCampaignId } from '../../../currentThreeSixtyCampaignId'

export default connect(
  state => ({ options: getParticipantOption(state) }),
  {
    fetchParticipantOptions,
    setCurrentCampaignId,
  },
)
