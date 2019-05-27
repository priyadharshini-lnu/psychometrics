import { connect } from 'react-redux'
import { getSubjectReport, getApprovalReports } from 'user/core/ThreesixtyCampaign/campaign/selectors'

const mapStateToProps = state => ({
  approvalReports: getApprovalReports(state.threeSixtyCampaign),
  subjectReport: getSubjectReport(state.threeSixtyCampaign),
  options: state.threeSixtyCampaign.campaign.options.participants,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
