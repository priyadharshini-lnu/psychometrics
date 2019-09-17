import { connect } from 'react-redux'
import {
  fetch,
  get as getMailHistory,
} from 'admin/core/threeSixtyCampaign/mailHistories'

export default connect(
  state => ({ mailHistories: getMailHistory(state) }),
  {
    fetch,
  },
)
