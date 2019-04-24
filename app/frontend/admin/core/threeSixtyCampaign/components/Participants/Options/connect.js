import { connect } from 'react-redux'
import { fetchParticipationOptions } from 'admin/core/threeSixtyCampaign/option/participants'

export default connect(
  ({ threeSixtyCampaign: { option: { participants } } }) => ({ participantOptions: participants }),
  { fetchParticipationOptions },
)
