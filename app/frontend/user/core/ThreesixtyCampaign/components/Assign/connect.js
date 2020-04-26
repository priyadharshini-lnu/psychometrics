import { connect } from 'react-redux'
import {
  fetchAssessment,
} from 'user/core/ThreesixtyCampaign/assign'
import { saveResults } from 'core/preview/FlowProcessor/actions'
import { getProgress } from 'core/preview/FlowProcessor/selectors'

const mapStateToProps = state => ({
  assign: state.threeSixtyCampaign.assign,
  isFrame: state.extras.isFrame,
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
})

const mapDispatchToProps = {
  fetchAssessment,
  saveResults,
}

export default connect(mapStateToProps, mapDispatchToProps)
