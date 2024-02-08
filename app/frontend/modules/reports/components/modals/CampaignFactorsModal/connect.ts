import { connect } from 'react-redux'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { saveCampaignFactors } from '~/modules/reports/core/builder/actions'
import { RootState } from '~/modules/reports/core/rootReducers'

export default connect(
  (state: RootState) => ({
    ...getData(state.report).campaignFactorsModal,
  }),
  {
    close: () => closeModal('campaignFactorsModal'),
    saveCampaignFactors,
  },
)
