import { connect } from 'react-redux'
import {
  fetch,
  update,
  getMessageOption,
} from 'modules/admin/core/threeSixtyCampaign/messageOptions'

export default connect(
  state => ({ options: getMessageOption(state) }),
  {
    fetch,
    update,
  },
)
