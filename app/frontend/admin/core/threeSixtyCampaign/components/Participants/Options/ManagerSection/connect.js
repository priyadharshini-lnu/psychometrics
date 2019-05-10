import { connect } from 'react-redux'
import _ from 'lodash'
import {
  update as updateParticipantOptions,
} from 'admin/core/threeSixtyCampaign/participantOptions/actions'
import { getManagerOption } from 'admin/core/threeSixtyCampaign/participantOptions/selectors'

export default connect(
  state => ({ options: getManagerOption(state) }),
  dispatch => ({
    updateParticipantOptions: _.curry((key, value) => dispatch(updateParticipantOptions(key, value))),
  }),
)
