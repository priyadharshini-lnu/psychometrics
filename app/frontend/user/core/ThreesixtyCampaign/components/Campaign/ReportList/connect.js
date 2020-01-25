import { connect } from 'react-redux'
import { getSubjectReport, getApprovalReports } from 'user/core/ThreesixtyCampaign/campaign/selectors'

const mapStateToProps = state => ({
  approvalReports: getApprovalReports(state.threeSixtyCampaign),
  reportsCounters: state.threeSixtyCampaign.campaign.reportsCounters,
  subjectReport: getSubjectReport(state.threeSixtyCampaign),
  options: state.threeSixtyCampaign.campaign.options.reports,
  instructions: state.threeSixtyCampaign.campaign.instructions,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
