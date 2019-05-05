import { connect } from 'react-redux'
import {
  updateParticipantOptions,
  addDatasheetCriteriaWithDefaultValue,
  removeDatasheetCriteria,
  updateDatasheetCriteria,
  getSubjectOption,
} from 'admin/core/threeSixtyCampaign/participantOptions/actions'

export default connect(
  state => ({ options: getSubjectOption(state) }),
  {
    updateParticipantOptions,
    addDatasheetCriteriaWithDefaultValue,
    removeDatasheetCriteria,
    updateDatasheetCriteria,
  },
)
