import { connect } from 'react-redux'
import {
  fetch as fetchReportOptions,
} from '~/modules/admin/modules/threeSixtyCampaign/core/reportOptions/actions'
import { getCampaignReportPermissions } from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'

export default connect(
  state => ({
    campaignReportPermissions: getCampaignReportPermissions(state),
  }),
  {
    fetchReportOptions,
  },
)
