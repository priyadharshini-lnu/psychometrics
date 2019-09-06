import { connect } from 'react-redux'
import { fetchReport, updateStatus, downloadReport } from 'user/core/ThreesixtyCampaign/report'

const mapStateToProps = state => ({
  report: state.threeSixtyCampaign.report,
  options: state.threeSixtyCampaign.report.options.reports,
})

const mapDispatchToProps = {
  fetchReport,
  updateStatus,
  downloadReport,
}

export default connect(mapStateToProps, mapDispatchToProps)
