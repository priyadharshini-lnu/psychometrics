import { connect } from 'react-redux'
import { reset as resetCampaign } from 'modules/user/modules/campaigns/core/campaign'
import { loginHogan, acceptPolicy } from '../../../core/campaigns'

const mapStateToProps = state => ({
  loaded: state.campaigns.campaign.loaded,
  campaign: state.campaigns.campaign,
  instructions: state.campaigns.campaign.instructions,
  currentUser: state.currentUser,
})

const mapDispatchToProps = {
  resetCampaign,
  loginHogan,
  acceptPolicy,
}

export default connect(mapStateToProps, mapDispatchToProps)
