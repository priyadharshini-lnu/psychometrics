import { connect } from 'react-redux'
import { fetchEvaluation, fetchAssessment } from 'user/core/ThreesixtyCampaign/evaluation'

const mapStateToProps = state => ({
  evaluation: state.threeSixtyCampaign.evaluation,
  results: state.threeSixtyCampaign.evaluation.results,
  assessment: state.threeSixtyCampaign.evaluation.assessment,
})

const mapDispatchToProps = {
  fetchEvaluation,
  fetchAssessment,
}

export default connect(mapStateToProps, mapDispatchToProps)
