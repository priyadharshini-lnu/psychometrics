import { connect } from 'react-redux'
import {
  fetchAssessment,
} from 'modules/user/modules/campaigns/core/assign'
import { saveResults } from 'core/preview/FlowProcessor/actions'
import { getProgress } from 'core/preview/FlowProcessor/selectors'
import { get as getConfig } from 'modules/user/core/config'

const mapStateToProps = state => ({
  assign: state.campaigns.assign,
  isFrame: getConfig(state).isFrame,
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
})

const mapDispatchToProps = {
  fetchAssessment,
  saveResults,
}

export default connect(mapStateToProps, mapDispatchToProps)
