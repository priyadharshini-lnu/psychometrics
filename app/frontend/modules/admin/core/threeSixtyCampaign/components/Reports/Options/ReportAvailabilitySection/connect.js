import { connect } from 'react-redux'
import _ from 'lodash'
import {
  update as updateReportOptions,
} from 'modules/admin/core/threeSixtyCampaign/reportOptions/actions'
import { getAvailabilityOption } from 'modules/admin/core/threeSixtyCampaign/reportOptions/selectors'

export default connect(
  state => ({ options: getAvailabilityOption(state) }),
  dispatch => ({
    updateReportOptions: _.curry((key, value) => dispatch(updateReportOptions(key, value))),
  }),
)
