import manageModal from 'components/hocs/manageModal'
import CampaignNameConfirmationModal from './CampaignNameConfirmationModal'
import connect from './connect'

CampaignNameConfirmationModal.className = 'CampaignNameConfirmationModal'

export default connect(manageModal(CampaignNameConfirmationModal))
