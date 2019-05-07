import { connect } from 'react-redux'
import { fetchReport } from 'user/core/ThreesixtyCampaign/reports'

const mapStateToProps = state => ({
  evaluations: state.threeSixtyCampaign.campaign.evaluations,
  report: state.threeSixtyCampaign.report,
})

const mapDispatchToProps = {
  fetchReport,
}

export default connect(mapStateToProps, mapDispatchToProps)
