import { connect } from 'react-redux'
import {
  update as updateParticipantOptions,
  getEvaluatorOption,
} from 'admin/core/threeSixtyCampaign/participantOptions/actions'

export default connect(
  state => ({ options: getEvaluatorOption(state) }),
  {
    updateParticipantOptions,
  },
)
