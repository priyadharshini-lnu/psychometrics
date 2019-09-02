import { connect } from 'react-redux'
import { downloadReport } from 'user/core/ThreesixtyCampaign/report'
import { fetchCampaigns, loginHogan } from '../../campaigns'

const mapStateToProps = state => ({
  campaigns: state.threeSixtyCampaign.campaigns,
  currentUser: state.threeSixtyCampaign.temp.currentUser,
})

const mapDispatchToProps = {
  fetchCampaigns,
  downloadReport,
  loginHogan,
}

export default connect(mapStateToProps, mapDispatchToProps)
