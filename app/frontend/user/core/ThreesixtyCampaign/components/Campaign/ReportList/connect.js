import { connect } from 'react-redux'
import { getSubjectReport, getApprovalReports } from 'user/core/ThreesixtyCampaign/campaign/selectors'

const mapStateToProps = state => ({
  approvalReports: getApprovalReports(state.threeSixtyCampaign),
  subjectReport: getSubjectReport(state.threeSixtyCampaign),
  options: state.threeSixtyCampaign.campaign.options.reports,
  helpContent: state.threeSixtyCampaign.campaign.helpContent,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
