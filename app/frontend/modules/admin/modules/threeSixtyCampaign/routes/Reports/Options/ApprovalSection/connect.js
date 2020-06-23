import { connect } from 'react-redux'
import _ from 'lodash'
import {
  update as updateReportOptions,
} from 'modules/admin/modules/threeSixtyCampaign/core/reportOptions/actions'
import { getApprovalOption } from 'modules/admin/modules/threeSixtyCampaign/core/reportOptions/selectors'

export default connect(
  state => ({ options: getApprovalOption(state) }),
  dispatch => ({
    updateReportOptions: _.curry((key, value) => dispatch(updateReportOptions(key, value))),
  }),
)
