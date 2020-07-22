import { connect } from 'react-redux'
import { getSubjectReport, getApprovalReports } from 'modules/user/modules/campaigns/core/campaign/selectors'

const mapStateToProps = state => ({
  approvalReports: getApprovalReports(state.campaigns),
  reportsCounters: state.campaigns.campaign.reportsCounters,
  subjectReport: getSubjectReport(state.campaigns),
  options: state.campaigns.campaign.options.reports,
  instructions: state.campaigns.campaign.instructions,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
