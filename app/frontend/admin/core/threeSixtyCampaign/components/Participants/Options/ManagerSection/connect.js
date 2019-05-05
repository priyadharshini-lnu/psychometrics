import { connect } from 'react-redux'
import {
  updateParticipantOptions,
  getManagerOption,
} from 'admin/core/threeSixtyCampaign/participantOptions/'

export default connect(
  state => ({ options: getManagerOption(state) }),
  {
    updateParticipantOptions,
  },
)
