import { connect } from 'react-redux'
import { fetchEvaluators } from '~/modules/admin/modules/threeSixtyCampaign/core/evaluators'
import { openModal } from '~/modules/admin/core/ui/modals'
import { removeUser } from '~/modules/admin/modules/threeSixtyCampaign/core'
import {
  edit as editUser,
} from '~/modules/admin/modules/threeSixtyCampaign/core/users'
import routeUtils from '~/utils/route'

export default connect(
  ({
    threeSixtyCampaign: {
      evaluators: { list, total, permissions },
    },
  }) => ({
    evaluators: list, total, permissions, page: routeUtils.getPage(), searchTerm: routeUtils.getSearchTerm(),
  }),
  dispatch => ({
    fetchEvaluators: (campaignId, page, query) => dispatch(fetchEvaluators(campaignId, page, query)),
    openModal: (name, data) => dispatch(openModal(name, data)),
    removeUser: (campaignId, userId) => dispatch(removeUser(campaignId, userId)),
    editUser: user => dispatch(editUser(user)),
  }),
)
