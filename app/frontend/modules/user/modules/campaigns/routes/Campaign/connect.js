import { connect } from 'react-redux'
import { fetchCampaign, reset as resetCampaign } from 'modules/user/modules/campaigns/core/campaign'

const mapStateToProps = state => ({
  loaded: state.campaigns.campaign.loaded,
  campaign: state.campaigns.campaign,
})

const mapDispatchToProps = {
  fetchCampaign,
  resetCampaign,
}

export default connect(mapStateToProps, mapDispatchToProps)
