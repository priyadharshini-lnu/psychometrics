import { connect } from 'react-redux'
import {
  fetchAssign, fetchAssessment,
} from 'user/core/ThreesixtyCampaign/assign'

const mapStateToProps = state => ({
  assign: state.threeSixtyCampaign.assign,
})

const mapDispatchToProps = {
  fetchAssign,
  fetchAssessment,
}

export default connect(mapStateToProps, mapDispatchToProps)
