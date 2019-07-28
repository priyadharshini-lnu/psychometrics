import { connect } from 'react-redux'
import { fetchManagers } from 'admin/core/threeSixtyCampaign/managers'
import { openModal } from 'admin/core/temp/modals'

export default connect(
  ({
    threeSixtyCampaign: {
      managers: { list, total },
    },
    temp: {
      pagination: { page },
    },
  }) => ({ managers: list, total, page }),
  dispatch => ({
    fetchManagers: (campaignId, page) => dispatch(fetchManagers(campaignId, page)),
    openModal: (name, data) => dispatch(openModal(name, data)),
  }),
)
