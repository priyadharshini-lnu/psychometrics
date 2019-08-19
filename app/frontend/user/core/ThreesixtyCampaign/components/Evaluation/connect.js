import { connect } from 'react-redux'
import {
  fetchEvaluation, fetchAssessment, clearEvalaution,
  updateStatus,
} from 'user/core/ThreesixtyCampaign/evaluation'

const mapStateToProps = state => ({
  evaluation: state.threeSixtyCampaign.evaluation,
})

const mapDispatchToProps = {
  fetchEvaluation,
  fetchAssessment,
  clearEvalaution,
  updateStatus,
}

export default connect(mapStateToProps, mapDispatchToProps)
