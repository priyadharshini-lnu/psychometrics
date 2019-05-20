import { connect } from 'react-redux'
import {
  fetch as fetchReportOptions,
} from 'admin/core/threeSixtyCampaign/reportOptions/actions'
import { getLodingState } from 'admin/core/temp/request'

export default connect(
  state => ({ loading: getLodingState(state) }),
  {
    fetchReportOptions,
  },
)
