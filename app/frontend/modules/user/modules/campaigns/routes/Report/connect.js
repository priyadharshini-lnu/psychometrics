import { connect } from 'react-redux'
import { fetchReport, updateStatus, downloadReport } from 'modules/user/modules/campaigns/core/report'

const mapStateToProps = state => ({
  report: state.campaigns.report,
  options: state.campaigns.report.options.reports,
})

const mapDispatchToProps = {
  fetchReport,
  updateStatus,
  downloadReport,
}

export default connect(mapStateToProps, mapDispatchToProps)
