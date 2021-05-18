import { connect } from 'react-redux'
import {
  fetchAssessment,
} from 'modules/user/modules/campaigns/core/assign'
import { markAssessmentTimedOut } from 'core/preview/FlowProcessor/actions'
import { getProgress } from 'core/preview/FlowProcessor/selectors'

const mapStateToProps = state => ({
  assign: state.campaigns.assign,
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
})

const mapDispatchToProps = {
  fetchAssessment,
  markAssessmentTimedOut,
}

export default connect(mapStateToProps, mapDispatchToProps)
