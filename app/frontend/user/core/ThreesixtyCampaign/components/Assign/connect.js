import { connect } from 'react-redux'
import {
  fetchAssessment,
} from 'user/core/ThreesixtyCampaign/assign'

const mapStateToProps = state => ({
  assign: state.threeSixtyCampaign.assign,
  isFrame: state.extras.isFrame,
})

const mapDispatchToProps = {
  fetchAssessment,
}

export default connect(mapStateToProps, mapDispatchToProps)
