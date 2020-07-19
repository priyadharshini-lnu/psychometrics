import { connect } from 'react-redux'
import {
  fetch,
  update,
  getMessageOption,
} from 'modules/admin/modules/threeSixtyCampaign/core/messageOptions'

export default connect(
  state => ({ options: getMessageOption(state) }),
  {
    fetch,
    update,
  },
)
