import { connect } from 'react-redux'
import { getApprovalNominations } from 'modules/user/modules/threesixtyCampaign/core/campaign/selectors'

const mapStateToProps = state => ({
  nominations: state.threeSixtyCampaign.campaign.nominations,
  nominationsCounters: state.threeSixtyCampaign.campaign.nominationsCounters,
  approvalNominations: getApprovalNominations(state.threeSixtyCampaign),
  options: state.threeSixtyCampaign.campaign.options.participants,
  instructions: state.threeSixtyCampaign.campaign.instructions,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
