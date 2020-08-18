import { connect } from 'react-redux'
import { getUserEvaluations, getManagedSubjects } from 'modules/user/modules/campaigns/core/campaign/selectors'
import { declineEvaluation } from 'modules/user/modules/campaigns/core/campaign'

const mapStateToProps = state => ({
  evaluations: getUserEvaluations(state),
  evaluationsCounters: state.campaigns.campaign.evaluationsCounters,
  managedSubjects: getManagedSubjects(state.campaigns),
  options: state.campaigns.campaign.options.participants,
  instructions: state.campaigns.campaign.instructions,
})

const mapDispatchToProps = {
  declineEvaluation,
}

export default connect(mapStateToProps, mapDispatchToProps)
