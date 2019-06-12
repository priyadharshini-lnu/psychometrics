import { connect } from 'react-redux'
import { fetchManagers } from 'admin/core/threeSixtyCampaign/managers'
import { openModal } from 'admin/core/temp/modals'

export default connect(
  ({ threeSixtyCampaign: { managers: { list, total } } }) => ({ managers: list, total }),
  dispatch => ({
    fetchManagers: (campaignId, offset) => dispatch(fetchManagers(campaignId, offset)),
    openModal: (name, data) => dispatch(openModal(name, data)),
  }),
)
