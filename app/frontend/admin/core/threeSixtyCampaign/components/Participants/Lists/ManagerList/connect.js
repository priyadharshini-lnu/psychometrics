import { connect } from 'react-redux'
import { fetchManagers } from 'admin/core/threeSixtyCampaign/managers'
import { openModal } from 'admin/core/temp/modals'
import routeUtils from 'utils/routeUtils'

export default connect(
  ({
    threeSixtyCampaign: {
      managers: { list, total },
    },
  }) => ({ managers: list, total, page: routeUtils.getPage() }),
  dispatch => ({
    fetchManagers: (campaignId, page) => dispatch(fetchManagers(campaignId, page)),
    openModal: (name, data) => dispatch(openModal(name, data)),
  }),
)
