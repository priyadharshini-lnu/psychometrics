import { connect } from 'react-redux'
import {
  updateLanguages,
} from '~/modules/admin/modules/threeSixtyCampaign/core/reportOptions/actions'
import { getReportLanguages } from '~/modules/admin/modules/threeSixtyCampaign/core/reportOptions/selectors'
import { getCampaignReportPermissions } from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'

export default connect(
  state => ({
    options: getReportLanguages(state),
    campaignReportPermissions: getCampaignReportPermissions(state),
  }),
  {
    updateLanguages,
  },
)
