import { connect } from 'react-redux'
import { fetchReport, updateStatus } from 'user/core/ThreesixtyCampaign/report'

const mapStateToProps = state => ({
  report: state.threeSixtyCampaign.report,
  options: state.threeSixtyCampaign.report.options.reports,
})

const mapDispatchToProps = {
  fetchReport,
  updateStatus,
}

export default connect(mapStateToProps, mapDispatchToProps)
