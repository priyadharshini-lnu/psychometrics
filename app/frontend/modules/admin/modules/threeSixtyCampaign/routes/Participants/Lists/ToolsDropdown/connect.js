import { connect } from 'react-redux'
import {
  reset as resetCampaign, resetAllNominations, exportCompletionStatuses, rescoreAssessment,
} from '~/modules/admin/modules/threeSixtyCampaign/core'
import { openModal } from '~/modules/admin/core/ui/modals'

export default connect(
  ({
    threeSixtyCampaign: {
      campaignDetails: { dimensionId },
    },
  }) => ({ dimensionId }),
  {
    resetCampaign, resetAllNominations, openModal, exportCompletionStatuses, rescoreAssessment,
  },
)
