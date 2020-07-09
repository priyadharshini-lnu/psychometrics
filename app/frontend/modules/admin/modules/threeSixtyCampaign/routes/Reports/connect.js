import { connect } from 'react-redux'
import { getCurrentReportId } from 'modules/admin/modules/threeSixtyCampaign/core/campaignDetails'

export default connect(
  state => ({ reportId: getCurrentReportId(state) }),
  null,
)
