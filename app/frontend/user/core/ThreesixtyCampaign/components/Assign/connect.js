import { connect } from 'react-redux'
import {
  fetchAssessment,
} from 'user/core/ThreesixtyCampaign/assign'
import { saveResults } from 'core/preview/FlowProcessor/actions'

const mapStateToProps = state => ({
  assign: state.threeSixtyCampaign.assign,
  isFrame: state.extras.isFrame,
  preview: state.preview,
})

const mapDispatchToProps = {
  fetchAssessment,
  saveResults,
}

export default connect(mapStateToProps, mapDispatchToProps)
