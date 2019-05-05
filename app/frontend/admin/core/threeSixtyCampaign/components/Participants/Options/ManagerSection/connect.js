import { connect } from 'react-redux'
import {
  update as updateParticipantOptions,
  getManagerOption,
} from 'admin/core/threeSixtyCampaign/participantOptions/actions'

export default connect(
  state => ({ options: getManagerOption(state) }),
  {
    updateParticipantOptions,
  },
)
