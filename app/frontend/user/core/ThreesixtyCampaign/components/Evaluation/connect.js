import { connect } from 'react-redux'
import {
  fetchEvaluation, fetchAssessment, clearEvaluation,
  updateStatus,
} from 'user/core/ThreesixtyCampaign/evaluation'

const mapStateToProps = state => ({
  evaluation: state.threeSixtyCampaign.evaluation,
})

const mapDispatchToProps = {
  fetchEvaluation,
  fetchAssessment,
  clearEvaluation,
  updateStatus,
}

export default connect(mapStateToProps, mapDispatchToProps)
