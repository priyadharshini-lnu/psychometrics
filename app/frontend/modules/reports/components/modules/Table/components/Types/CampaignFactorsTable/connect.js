import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import { getCampaignFactors } from '~/modules/reports/core/builder/selectors'

export default connect(
  state => ({
    benchmarkScores: state,
    campaignFactors: getCampaignFactors(state),
  }),
  {
    openConditionModal: data => openModal('CampaignFactorCondition', data),
  },
)
