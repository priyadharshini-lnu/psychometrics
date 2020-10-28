import { connect } from 'react-redux'
import {
  fetchCampaign,
  beginCampaign,
  continueCampaign,
  reset as resetCampaign,
} from 'modules/user/modules/campaigns/core/campaign'
import { loginHogan } from '../../../core/campaigns'
import { acceptPolicy } from '../../../core/project'

const mapStateToProps = state => ({
  loaded: state.campaigns.campaign.loaded,
  campaign: state.campaigns.campaign,
  instructions: state.campaigns.campaign.instructions,
  currentUser: state.currentUser,
})

const mapDispatchToProps = {
  fetchCampaign,
  beginCampaign,
  continueCampaign,
  resetCampaign,
  loginHogan,
  acceptPolicy,
}

export default connect(mapStateToProps, mapDispatchToProps)
