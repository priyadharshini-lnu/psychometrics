import { connect } from 'react-redux'
import { getCurrentCampaignName } from 'modules/admin/core/threeSixtyCampaign/campaignDetails/'
import { closeModal, getCurrent, getData } from 'modules/admin/core/temp/modals'

export default connect(
  state => ({
    current: getCurrent(state),
    campaignName: getCurrentCampaignName(state),
    data: getData(state).CampaignNameConfirmationModal,
  }),
  { closeModal },
)
