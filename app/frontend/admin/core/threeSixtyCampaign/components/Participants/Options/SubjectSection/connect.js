import { connect } from 'react-redux'
import {
  fetchParticipantOptions,
  updateParticipantOptions,
  addDatasheetCriteria,
  removeDatasheetCriteria,
  updateDatasheetCriteria,
  getSubjectOption,
} from 'admin/core/threeSixtyCampaign/participantOptions/'

export default connect(
  state => getSubjectOption(state),
  {
    fetchParticipantOptions,
    updateParticipantOptions,
    addDatasheetCriteria,
    removeDatasheetCriteria,
    updateDatasheetCriteria,
  },
)
