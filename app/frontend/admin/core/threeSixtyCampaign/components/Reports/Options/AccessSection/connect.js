import { connect } from 'react-redux'
import _ from 'lodash'
import {
  update as updateReportOptions,
} from 'admin/core/threeSixtyCampaign/reportOptions/actions'
import { getAccessOption } from 'admin/core/threeSixtyCampaign/reportOptions/selectors'

export default connect(
  state => ({ options: getAccessOption(state) }),
  dispatch => ({
    updateReportOptions: _.curry((key, value) => dispatch(updateReportOptions(key, value))),
  }),
)
