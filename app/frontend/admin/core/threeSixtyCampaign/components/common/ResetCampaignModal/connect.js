import { connect } from 'react-redux'
import { getCurrentCampaignName } from 'admin/core/threeSixtyCampaign/campaignDetails/'
import { closeModal, getCurrent, getData } from 'admin/core/temp/modals'

export default connect(
  state => ({
    current: getCurrent(state),
    campaignName: getCurrentCampaignName(state),
    data: getData(state).ResetCampaignModal,
    currentUser: state.temp.currentUser,
  }),
  { closeModal },
)
