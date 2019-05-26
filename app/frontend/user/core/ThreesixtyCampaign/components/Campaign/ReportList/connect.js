import { connect } from 'react-redux'
import { getSubjectReport } from 'user/core/ThreesixtyCampaign/campaign/selectors'

const mapStateToProps = state => ({
  reports: state.threeSixtyCampaign.campaign.reports,
  subjectReport: getSubjectReport(state.threeSixtyCampaign),
  options: state.threeSixtyCampaign.campaign.options.reports,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
