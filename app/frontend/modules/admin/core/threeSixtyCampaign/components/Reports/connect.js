import { connect } from 'react-redux'
import { getCurrentReportId } from 'modules/admin/core/threeSixtyCampaign/campaignDetails'

export default connect(
  state => ({ reportId: getCurrentReportId(state) }),
  null,
)
