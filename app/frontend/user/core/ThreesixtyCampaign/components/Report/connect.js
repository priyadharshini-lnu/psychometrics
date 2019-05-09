import { connect } from 'react-redux'
import { fetchReport } from 'user/core/ThreesixtyCampaign/report'

const mapStateToProps = state => ({
  report: state.threeSixtyCampaign.report,
})

const mapDispatchToProps = {
  fetchReport,
}

export default connect(mapStateToProps, mapDispatchToProps)
