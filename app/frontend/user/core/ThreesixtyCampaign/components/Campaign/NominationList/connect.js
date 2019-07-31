import { connect } from 'react-redux'
import { getApprovalNominations } from 'user/core/ThreesixtyCampaign/campaign/selectors'

const mapStateToProps = state => ({
  nominations: state.threeSixtyCampaign.campaign.nominations,
  approvalNominations: getApprovalNominations(state.threeSixtyCampaign),
  options: state.threeSixtyCampaign.campaign.options.participants,
  helpContent: state.threeSixtyCampaign.campaign.helpContent,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
