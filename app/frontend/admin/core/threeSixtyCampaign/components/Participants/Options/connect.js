import { connect } from 'react-redux'
import { fetchParticipationOptions, updateParticipationOptions, addDatasheetCriteria, removeDatasheetCriteria,updateDatasheetCriteria } from 'admin/core/threeSixtyCampaign/option/participants'

export default connect(
  ({ threeSixtyCampaign: { option: { participants } } }) => ({ participantOptions: participants }),
  { fetchParticipationOptions, updateParticipationOptions, addDatasheetCriteria, removeDatasheetCriteria, updateDatasheetCriteria },
)
