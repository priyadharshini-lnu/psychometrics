import { connect } from 'react-redux'
import {
  fetch as fetchReportOptions,
} from 'modules/admin/modules/threeSixtyCampaign/core/reportOptions/actions'
import { getLoadingState } from 'modules/admin/core/request'

export default connect(
  state => ({ loading: getLoadingState(state) }),
  {
    fetchReportOptions,
  },
)
