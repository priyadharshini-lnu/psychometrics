import { connect } from 'react-redux'
import { getApprovalEvaluations } from 'user/core/ThreesixtyCampaign/campaign/selectors'

const mapStateToProps = state => ({
  evaluations: state.threeSixtyCampaign.campaign.evaluations,
  approvalEvaluations: getApprovalEvaluations(state.threeSixtyCampaign),
  options: state.threeSixtyCampaign.campaign.options.participants,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
