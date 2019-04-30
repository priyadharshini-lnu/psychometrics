import { connect } from 'react-redux'
import {
  fetchParticipationOptions,
  updateParticipationOptions,
  addDatasheetCriteria,
  removeDatasheetCriteria,
  updateDatasheetCriteria,
  getParticipantOption,
} from 'admin/core/threeSixtyCampaign/participantOptions/'

export default connect(
  state => getParticipantOption(state),
  {
    fetchParticipationOptions,
    updateParticipationOptions,
    addDatasheetCriteria,
    removeDatasheetCriteria,
    updateDatasheetCriteria,
  },
)
