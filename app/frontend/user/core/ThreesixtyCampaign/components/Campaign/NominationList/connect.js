import { connect } from 'react-redux'
import { getApprovalNominations } from 'user/core/ThreesixtyCampaign/campaign/selectors'

const mapStateToProps = state => ({
  nominations: state.threeSixtyCampaign.campaign.nominations,
  nominationsCounters: state.threeSixtyCampaign.campaign.nominationsCounters,
  approvalNominations: getApprovalNominations(state.threeSixtyCampaign),
  options: state.threeSixtyCampaign.campaign.options.participants,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
