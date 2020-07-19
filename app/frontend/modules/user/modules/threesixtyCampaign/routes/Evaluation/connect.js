import { connect } from 'react-redux'
import {
  fetchEvaluation, fetchAssessment, clearEvaluation,
  updateStatus,
} from 'modules/user/modules/threesixtyCampaign/core/evaluation'
import { saveResults } from 'core/preview/FlowProcessor/actions'
import { getProgress } from 'core/preview/FlowProcessor/selectors'

const mapStateToProps = state => ({
  evaluation: state.threeSixtyCampaign.evaluation,
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
})

const mapDispatchToProps = {
  fetchEvaluation,
  fetchAssessment,
  clearEvaluation,
  updateStatus,
  saveResults,
}

export default connect(mapStateToProps, mapDispatchToProps)
