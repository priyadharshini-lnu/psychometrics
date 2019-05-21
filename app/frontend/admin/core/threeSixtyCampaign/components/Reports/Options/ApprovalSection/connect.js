import { connect } from 'react-redux'
import _ from 'lodash'
import {
  update as updateReportOptions,
} from 'admin/core/threeSixtyCampaign/reportOptions/actions'
import { getApprovalOption } from 'admin/core/threeSixtyCampaign/reportOptions/selectors'

export default connect(
  state => ({ options: getApprovalOption(state) }),
  dispatch => ({
    updateReportOptions: _.curry((key, value) => dispatch(updateReportOptions(key, value))),
  }),
)
