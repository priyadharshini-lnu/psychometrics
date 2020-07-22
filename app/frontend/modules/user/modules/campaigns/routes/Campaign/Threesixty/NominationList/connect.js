import { connect } from 'react-redux'
import { getApprovalNominations } from 'modules/user/modules/campaigns/core/campaign/selectors'

const mapStateToProps = state => ({
  nominations: state.campaigns.campaign.nominations,
  nominationsCounters: state.campaigns.campaign.nominationsCounters,
  approvalNominations: getApprovalNominations(state.campaigns),
  options: state.campaigns.campaign.options.participants,
  instructions: state.campaigns.campaign.instructions,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
