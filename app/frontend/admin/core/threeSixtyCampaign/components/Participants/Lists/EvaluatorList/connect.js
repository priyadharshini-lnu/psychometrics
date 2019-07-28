import { connect } from 'react-redux'
import { fetchEvaluators } from 'admin/core/threeSixtyCampaign/evaluators'
import { openModal } from 'admin/core/temp/modals'
import { removeUser } from 'admin/core/threeSixtyCampaign/'

export default connect(
  ({
    threeSixtyCampaign: {
      evaluators: { list, total },
    },
    temp: {
      pagination: { page },
    },
  }) => ({ evaluators: list, total, page }),
  dispatch => ({
    fetchEvaluators: (campaignId, offset) => dispatch(fetchEvaluators(campaignId, offset)),
    openModal: (name, data) => dispatch(openModal(name, data)),
    removeUser: (campaignId, userId) => dispatch(removeUser(campaignId, userId)),
  }),
)
