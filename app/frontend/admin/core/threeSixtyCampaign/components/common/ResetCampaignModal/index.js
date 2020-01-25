import manageModal from 'components/hocs/manageModal'
import ResetCampaignModal from './ResetCampaignModal'
import connect from './connect'

ResetCampaignModal.className = 'ResetCampaignModal'

export default connect(manageModal(ResetCampaignModal))
