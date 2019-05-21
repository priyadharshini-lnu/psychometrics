import { connect } from 'react-redux'
import { getApprovalEvaluations } from 'user/core/ThreesixtyCampaign/campaign/selectors'
import { declineEvaluation } from 'user/core/ThreesixtyCampaign/campaign'

const mapStateToProps = state => ({
  evaluations: state.threeSixtyCampaign.campaign.evaluations,
  approvalEvaluations: getApprovalEvaluations(state.threeSixtyCampaign),
  options: state.threeSixtyCampaign.campaign.options.participants,
})

const mapDispatchToProps = {
  declineEvaluation,
}

export default connect(mapStateToProps, mapDispatchToProps)
