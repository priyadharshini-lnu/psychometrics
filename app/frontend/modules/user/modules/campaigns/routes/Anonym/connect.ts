import { connect } from 'react-redux'
import {
  fetchAssessment,
} from 'modules/user/modules/campaigns/core/anonym'
import { saveResults } from 'core/preview/FlowProcessor/actions'

const mapStateToProps = state => ({
  preview: state.preview,
  anonym: state.anonym,
})

const mapDispatchToProps = {
  fetchAssessment,
  saveResults,
}

export default connect(mapStateToProps, mapDispatchToProps)
