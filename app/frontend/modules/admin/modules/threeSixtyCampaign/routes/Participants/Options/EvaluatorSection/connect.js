import { connect } from 'react-redux'
import _ from 'lodash'
import {
  update as updateParticipantOptions,
} from '~/modules/admin/modules/threeSixtyCampaign/core/participantOptions/actions'
import { getEvaluatorOption } from '~/modules/admin/modules/threeSixtyCampaign/core/participantOptions/selectors'

export default connect(
  state => ({ options: getEvaluatorOption(state) }),
  dispatch => ({
    updateParticipantOptions: _.curry((key, value) => dispatch(updateParticipantOptions(key, value))),
  }),
)
