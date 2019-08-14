import { connect } from 'react-redux'
import {
  fetchEvaluation, fetchAssessment, clearEvalaution,
  updateStatus, denyEvaluation,
} from 'user/core/ThreesixtyCampaign/evaluation'

const mapStateToProps = state => ({
  evaluation: state.threeSixtyCampaign.evaluation,
})

const mapDispatchToProps = {
  fetchEvaluation,
  fetchAssessment,
  clearEvalaution,
  updateStatus,
  denyEvaluation,
}

export default connect(mapStateToProps, mapDispatchToProps)
