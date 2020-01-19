import { connect } from 'react-redux'
import { fetchEvaluators } from 'admin/core/threeSixtyCampaign/evaluators'
import { openModal } from 'admin/core/temp/modals'
import { removeUser } from 'admin/core/threeSixtyCampaign/'
import routeUtils from 'utils/routeUtils'
import {
  edit as editUser,
} from 'admin/core/threeSixtyCampaign/users'

export default connect(
  ({
    threeSixtyCampaign: {
      evaluators: { list, total },
    },
  }) => ({
    evaluators: list, total, page: routeUtils.getPage(), searchTerm: routeUtils.getSearchTerm(),
  }),
  dispatch => ({
    fetchEvaluators: (campaignId, page, query) => dispatch(fetchEvaluators(campaignId, page, query)),
    openModal: (name, data) => dispatch(openModal(name, data)),
    removeUser: (campaignId, userId) => dispatch(removeUser(campaignId, userId)),
    editUser: user => dispatch(editUser(user)),
  }),
)
