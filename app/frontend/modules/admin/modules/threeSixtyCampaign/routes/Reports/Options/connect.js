import { connect } from 'react-redux'
import {
  fetch as fetchReportOptions,
} from 'modules/admin/modules/threeSixtyCampaign/core/reportOptions/actions'
import { getLodingState } from 'modules/admin/core/temp/request'

export default connect(
  state => ({ loading: getLodingState(state) }),
  {
    fetchReportOptions,
  },
)
