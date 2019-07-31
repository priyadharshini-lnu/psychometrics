import { connect } from 'react-redux'
import { getUserEvaluations, getManagedSubjects } from 'user/core/ThreesixtyCampaign/campaign/selectors'
import { declineEvaluation } from 'user/core/ThreesixtyCampaign/campaign'

const mapStateToProps = state => ({
  evaluations: getUserEvaluations(state.threeSixtyCampaign),
  managedSubjects: getManagedSubjects(state.threeSixtyCampaign),
  options: state.threeSixtyCampaign.campaign.options.participants,
  helpContent: state.threeSixtyCampaign.campaign.helpContent,
})

const mapDispatchToProps = {
  declineEvaluation,
}

export default connect(mapStateToProps, mapDispatchToProps)
