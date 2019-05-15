import { connect } from 'react-redux'
import { fetchEvaluation, fetchAssessment } from 'user/core/ThreesixtyCampaign/evaluation'

const mapStateToProps = state => ({
  evaluations: state.threeSixtyCampaign.campaign.evaluations,
  evaluation: state.threeSixtyCampaign.evaluation,
  subject: state.threeSixtyCampaign.evaluation.subject,
  results: state.threeSixtyCampaign.evaluation.results,
  assessment: state.threeSixtyCampaign.evaluation.assessment,
})

const mapDispatchToProps = {
  fetchEvaluation,
  fetchAssessment,
}

export default connect(mapStateToProps, mapDispatchToProps)
