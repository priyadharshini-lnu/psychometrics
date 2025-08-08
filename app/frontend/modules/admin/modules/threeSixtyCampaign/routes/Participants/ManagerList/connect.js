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
      campaignDetails: { id: threeSixtyCampaignId },
      managers: { list, total, permissions },
      campaignDetails: {
        template,
      },
    },
  }) => ({
    managers: list,
    threeSixtyCampaignId,
    total,
    permissions,
    page: routeUtils.getPage(),
    searchTerm: routeUtils.getSearchTerm(),
    template,
  }),
  dispatch => ({
    fetchManagers: (campaignId, page, query) => dispatch(fetchManagers(campaignId, page, query)),
    openModal: (name, data) => dispatch(openModal(name, data)),
    editUser: user => dispatch(editUser(user)),
    removeUser: (campaignId, userId) => dispatch(removeUser(campaignId, userId)),
  }),
)
