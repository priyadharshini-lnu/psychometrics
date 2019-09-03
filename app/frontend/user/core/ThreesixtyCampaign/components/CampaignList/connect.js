import { connect } from 'react-redux'
import { downloadReport } from 'user/core/ThreesixtyCampaign/report'
import { fetchCampaigns, loginHogan, acceptPolicy } from '../../campaigns'

const mapStateToProps = state => ({
  campaigns: state.threeSixtyCampaign.campaigns,
  currentUser: state.threeSixtyCampaign.temp.currentUser,
})

const mapDispatchToProps = {
  fetchCampaigns,
  downloadReport,
  loginHogan,
  acceptPolicy,
}

export default connect(mapStateToProps, mapDispatchToProps)
