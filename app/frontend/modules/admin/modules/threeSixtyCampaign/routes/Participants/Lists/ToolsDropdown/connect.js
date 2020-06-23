import { connect } from 'react-redux'
import { reset as resetCampaign, resetAllNominations } from 'modules/admin/modules/threeSixtyCampaign/core'
import { openModal } from 'modules/admin/core/temp/modals'

export default connect(
  ({
    threeSixtyCampaign: {
      campaignDetails: { dimensionId },
    },
  }) => ({ dimensionId }),
  { resetCampaign, resetAllNominations, openModal },
)
