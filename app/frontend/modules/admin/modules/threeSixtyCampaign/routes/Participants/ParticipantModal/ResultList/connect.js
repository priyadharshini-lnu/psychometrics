import { connect } from 'react-redux'
import { getResults, update, removeEvaluation } from '~/modules/admin/modules/threeSixtyCampaign/core/participants'

export default connect(
  state => ({
    participants: getResults(state),
    relationships: state.project.relationships,
    options: state.threeSixtyCampaign.campaignDetails.options,
  }),
  { update, remove: removeEvaluation },
)
