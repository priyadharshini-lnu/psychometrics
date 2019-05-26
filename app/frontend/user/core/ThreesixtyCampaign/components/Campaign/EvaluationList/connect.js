import { connect } from 'react-redux'
import { getUserEvaluations, getApprovalEvaluations } from 'user/core/ThreesixtyCampaign/campaign/selectors'
import { declineEvaluation } from 'user/core/ThreesixtyCampaign/campaign'

const mapStateToProps = state => ({
  evaluations: getUserEvaluations(state.threeSixtyCampaign),
  approvalEvaluations: getApprovalEvaluations(state.threeSixtyCampaign),
  options: state.threeSixtyCampaign.campaign.options.participants,
})

const mapDispatchToProps = {
  declineEvaluation,
}

export default connect(mapStateToProps, mapDispatchToProps)
