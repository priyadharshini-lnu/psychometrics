import { connect } from 'react-redux'
import {
  fetchParticipantOptions,
  updateParticipantOptions,
  addDatasheetCriteria,
  removeDatasheetCriteria,
  updateDatasheetCriteria,
  getParticipantOption,
} from 'admin/core/threeSixtyCampaign/participantOptions/'
import { setId as setCurrentCampaignId } from '../../../currentThreeSixtyCampaignId'

export default connect(
  state => getParticipantOption(state),
  {
    fetchParticipantOptions,
    updateParticipantOptions,
    addDatasheetCriteria,
    removeDatasheetCriteria,
    updateDatasheetCriteria,
    setCurrentCampaignId,
  },
)
