import { connect } from 'react-redux'
import { fetchCampaigns } from '../../campaignList'

const mapStateToProps = state => ({
  campaigns: state.threeSixtyCampaign.campaignList.campaigns,
  currentUser: state.threeSixtyCampaign.temp.currentUser,
})

const mapDispatchToProps = {
  fetchCampaigns,
}

export default connect(mapStateToProps, mapDispatchToProps)
