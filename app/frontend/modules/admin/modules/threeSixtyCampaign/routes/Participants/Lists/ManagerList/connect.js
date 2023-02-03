import { connect } from 'react-redux'
import { fetchManagers } from '~/modules/admin/modules/threeSixtyCampaign/core/managers'
import { openModal } from '~/modules/admin/core/ui/modals'
import { removeUser } from '~/modules/admin/modules/threeSixtyCampaign/core'
import {
  edit as editUser,
} from '~/modules/admin/modules/threeSixtyCampaign/core/users'
import routeUtils from '~/utils/route'

export default connect(
  ({
    threeSixtyCampaign: {
      managers: { list, total, permissions },
    },
  }) => ({
    managers: list, total, permissions, page: routeUtils.getPage(), searchTerm: routeUtils.getSearchTerm(),
  }),
  dispatch => ({
    fetchManagers: (campaignId, page, query) => dispatch(fetchManagers(campaignId, page, query)),
    openModal: (name, data) => dispatch(openModal(name, data)),
    editUser: user => dispatch(editUser(user)),
    removeUser: (campaignId, userId) => dispatch(removeUser(campaignId, userId)),
  }),
)
