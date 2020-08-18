import { connect } from 'react-redux'
import { downloadReport } from 'modules/user/modules/campaigns/core/report'
import { get as getCurrentUser } from 'core/currentUser'
import { fetchCampaigns, loginHogan, acceptPolicy } from '../../core/campaigns'

const mapStateToProps = state => ({
  campaigns: state.campaigns.campaigns,
  currentUser: getCurrentUser(state),
})

const mapDispatchToProps = {
  fetchCampaigns,
  downloadReport,
  loginHogan,
  acceptPolicy,
}

export default connect(mapStateToProps, mapDispatchToProps)
