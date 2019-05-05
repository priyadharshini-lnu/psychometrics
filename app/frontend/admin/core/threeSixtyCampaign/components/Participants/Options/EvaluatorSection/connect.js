import { connect } from 'react-redux'
import {
  updateParticipantOptions,
  getEvaluatorOption,
} from 'admin/core/threeSixtyCampaign/participantOptions/'

export default connect(
  state => ({ options: getEvaluatorOption(state) }),
  {
    updateParticipantOptions,
  },
)
