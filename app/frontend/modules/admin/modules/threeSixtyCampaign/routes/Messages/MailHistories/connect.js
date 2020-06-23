import { connect } from 'react-redux'
import {
  fetch,
  remove,
  get as getMailHistory,
} from 'modules/admin/modules/threeSixtyCampaign/core/mailHistories'
import { openModal } from 'modules/admin/core/temp/modals'
import routeUtils from 'utils/routeUtils'

export default connect(
  state => ({ mailHistories: getMailHistory(state), page: routeUtils.getPage() }),
  {
    fetch,
    remove,
    openModal,
  },
)
