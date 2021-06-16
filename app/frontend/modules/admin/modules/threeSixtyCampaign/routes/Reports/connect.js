import { connect } from 'react-redux'
import {
  getCurrentReportId, getCampaignReportPermissions,
} from 'modules/admin/modules/threeSixtyCampaign/core/campaignDetails'

export default connect(
  state => ({
    reportId: getCurrentReportId(state),
    campaignReportPermissions: getCampaignReportPermissions(state),
  }),
  null,
)
