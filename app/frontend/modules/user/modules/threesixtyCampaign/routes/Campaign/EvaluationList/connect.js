import { connect } from 'react-redux'
import { getUserEvaluations, getManagedSubjects } from 'modules/user/modules/threesixtyCampaign/core/campaign/selectors'
import { declineEvaluation } from 'modules/user/modules/threesixtyCampaign/core/campaign'

const mapStateToProps = state => ({
  evaluations: getUserEvaluations(state.threeSixtyCampaign),
  evaluationsCounters: state.threeSixtyCampaign.campaign.evaluationsCounters,
  managedSubjects: getManagedSubjects(state.threeSixtyCampaign),
  options: state.threeSixtyCampaign.campaign.options.participants,
  instructions: state.threeSixtyCampaign.campaign.instructions,
})

const mapDispatchToProps = {
  declineEvaluation,
}

export default connect(mapStateToProps, mapDispatchToProps)
