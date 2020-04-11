import { connect } from 'react-redux'
import {
  fetchEvaluation, fetchAssessment, clearEvaluation,
  updateStatus,
} from 'user/core/ThreesixtyCampaign/evaluation'
import { saveResults } from 'core/preview/FlowProcessor/actions'

const mapStateToProps = state => ({
  evaluation: state.threeSixtyCampaign.evaluation,
  preview: state.preview,
})

const mapDispatchToProps = {
  fetchEvaluation,
  fetchAssessment,
  clearEvaluation,
  updateStatus,
  saveResults,
}

export default connect(mapStateToProps, mapDispatchToProps)
