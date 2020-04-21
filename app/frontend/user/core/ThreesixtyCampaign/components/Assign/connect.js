import { connect } from 'react-redux'
import {
  fetchAssessment,
} from 'user/core/ThreesixtyCampaign/assign'
import { saveResults } from 'core/preview/FlowProcessor/actions'
import { getCurrentBlock } from 'core/preview/FlowProcessor/selectors'

const mapStateToProps = state => ({
  assign: state.threeSixtyCampaign.assign,
  isFrame: state.extras.isFrame,
  preview: state.preview,
  block: state.preview.initialized ? getCurrentBlock(state.preview) : {},
})

const mapDispatchToProps = {
  fetchAssessment,
  saveResults,
}

export default connect(mapStateToProps, mapDispatchToProps)
