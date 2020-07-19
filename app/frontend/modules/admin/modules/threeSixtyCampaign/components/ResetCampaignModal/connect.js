import { connect } from 'react-redux'
import { getCurrentCampaignName } from 'modules/admin/modules/threeSixtyCampaign/core/campaignDetails/'
import { closeModal, getCurrent, getData } from 'modules/admin/core/ui/modals'
import { get as getCurrentUser } from 'core/currentUser'

export default connect(
  state => ({
    current: getCurrent(state),
    campaignName: getCurrentCampaignName(state),
    data: getData(state).ResetCampaignModal,
    currentUser: getCurrentUser(state),
  }),
  { closeModal },
)
