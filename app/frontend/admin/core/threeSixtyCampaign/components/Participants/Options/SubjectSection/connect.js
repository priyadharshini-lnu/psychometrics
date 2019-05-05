import { connect } from 'react-redux'
import {
  updateParticipantOptions,
  addDatasheetCriteria,
  removeDatasheetCriteria,
  updateDatasheetCriteria,
  getSubjectOption,
} from 'admin/core/threeSixtyCampaign/participantOptions/'

export default connect(
  state => ({ options: getSubjectOption(state) }),
  {
    updateParticipantOptions,
    addDatasheetCriteria,
    removeDatasheetCriteria,
    updateDatasheetCriteria,
  },
)
