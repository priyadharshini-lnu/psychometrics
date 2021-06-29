import { connect } from 'react-redux'
import _ from 'lodash'
import {
  update as updateReportOptions,
} from 'modules/admin/modules/threeSixtyCampaign/core/reportOptions/actions'
import { getAvailabilityOption } from 'modules/admin/modules/threeSixtyCampaign/core/reportOptions/selectors'
import { getCampaignReportPermissions } from 'modules/admin/modules/threeSixtyCampaign/core/campaignDetails'

export default connect(
  state => ({
    options: getAvailabilityOption(state),
    campaignReportPermissions: getCampaignReportPermissions(state),
  }),
  dispatch => ({
    updateReportOptions: _.curry((key, value) => dispatch(updateReportOptions(key, value))),
  }),
)
