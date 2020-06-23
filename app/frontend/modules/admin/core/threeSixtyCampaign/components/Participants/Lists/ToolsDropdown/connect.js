import { connect } from 'react-redux'
import { reset as resetCampaign, resetAllNominations } from 'modules/admin/core/threeSixtyCampaign/'
import { openModal } from 'modules/admin/core/temp/modals'

export default connect(
  ({
    threeSixtyCampaign: {
      campaignDetails: { dimensionId },
    },
  }) => ({ dimensionId }),
  { resetCampaign, resetAllNominations, openModal },
)
