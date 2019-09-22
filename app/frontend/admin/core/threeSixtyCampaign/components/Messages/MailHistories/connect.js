import { connect } from 'react-redux'
import {
  fetch,
  get as getMailHistory,
} from 'admin/core/threeSixtyCampaign/mailHistories'
import routeUtils from 'utils/routeUtils'

export default connect(
  state => ({ mailHistories: getMailHistory(state), page: routeUtils.getPage() }),
  {
    fetch,
  },
)
