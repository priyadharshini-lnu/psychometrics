import { connect } from 'react-redux'
import { fetchManagers } from 'admin/core/threeSixtyCampaign/managers'
import { openModal } from 'admin/core/temp/modals'
import routeUtils from 'utils/routeUtils'
import {
  edit as editUser,
} from 'admin/core/threeSixtyCampaign/users'

export default connect(
  ({
    threeSixtyCampaign: {
      managers: { list, total },
    },
  }) => ({
    managers: list, total, page: routeUtils.getPage(), searchTerm: routeUtils.getSearchTerm(),
  }),
  dispatch => ({
    fetchManagers: (campaignId, page, query) => dispatch(fetchManagers(campaignId, page, query)),
    openModal: (name, data) => dispatch(openModal(name, data)),
    editUser: user => dispatch(editUser(user)),
  }),
)
