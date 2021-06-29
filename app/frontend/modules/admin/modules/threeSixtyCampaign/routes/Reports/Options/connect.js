import { connect } from 'react-redux'
import {
  fetch as fetchReportOptions,
} from 'modules/admin/modules/threeSixtyCampaign/core/reportOptions/actions'
import { getLoadingState } from 'modules/admin/core/request'
import { getCampaignReportPermissions } from 'modules/admin/modules/threeSixtyCampaign/core/campaignDetails'

export default connect(
  state => ({
    loading: getLoadingState(state),
    campaignReportPermissions: getCampaignReportPermissions(state),
  }),
  {
    fetchReportOptions,
  },
)
