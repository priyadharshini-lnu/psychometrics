import { connect } from 'react-redux'
import {
  getCurrentReportId, getCampaignReportPermissions,
} from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'
import { get as getCurrentUser } from '~/core/currentUser'

export default connect(
  state => ({
    reportId: getCurrentReportId(state),
    campaignReportPermissions: getCampaignReportPermissions(state),
    currentUser: getCurrentUser(state),
  }),
  null,
)
