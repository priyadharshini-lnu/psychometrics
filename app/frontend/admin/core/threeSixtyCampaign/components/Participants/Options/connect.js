import { connect } from 'react-redux'
import {
  fetchParticipationOptions,
  updateParticipationOptions,
  addDatasheetCriteria,
  removeDatasheetCriteria,
  updateDatasheetCriteria,
  getParticipantOption,
} from 'admin/core/threeSixtyCampaign/option/participants'

export default connect(
  state => ({ participantOptions: getParticipantOption(state) }),
  {
    fetchParticipationOptions,
    updateParticipationOptions,
    addDatasheetCriteria,
    removeDatasheetCriteria,
    updateDatasheetCriteria,
  },
)
