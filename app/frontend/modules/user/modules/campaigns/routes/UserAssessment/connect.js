import { connect } from 'react-redux'
import {
  fetchAssessment,
} from 'modules/user/modules/campaigns/core/userAssessment'
import { markAssessmentTimedOut } from 'core/preview/FlowProcessor/actions'
import { getProgress } from 'core/preview/FlowProcessor/selectors'
import { push } from 'connected-react-router'

const mapStateToProps = state => ({
  userAssessment: state.campaigns.userAssessment,
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
  started: state.preview.started,
})

const mapDispatchToProps = {
  fetchAssessment,
  markAssessmentTimedOut,
  push,
}

export default connect(mapStateToProps, mapDispatchToProps)
