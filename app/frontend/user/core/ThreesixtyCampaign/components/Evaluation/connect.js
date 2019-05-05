import { connect } from 'react-redux'
import { fetchEvaluation } from 'user/core/ThreesixtyCampaign/evaluation'

const mapStateToProps = state => ({
  evaluations: state.threeSixtyCampaign.campaign.evaluations,
  evaluation: state.threeSixtyCampaign.evaluation,
  subject: state.threeSixtyCampaign.evaluation.subject,
  results: state.threeSixtyCampaign.evaluation.results,
})

const mapDispatchToProps = {
  fetchEvaluation,
}

export default connect(mapStateToProps, mapDispatchToProps)
