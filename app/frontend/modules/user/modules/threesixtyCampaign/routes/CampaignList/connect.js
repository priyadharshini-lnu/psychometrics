import { connect } from 'react-redux'
import { downloadReport } from 'modules/user/modules/threesixtyCampaign/core/report'
import { fetchCampaigns, loginHogan, acceptPolicy } from '../../core/campaigns'

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
