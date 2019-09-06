import manageModal from 'components/hocs/manageModal'
import SendTestEmailModal from './SendTestEmailModal'
import connect from './connect'

SendTestEmailModal.className = 'SendTestEmailModal'

export default connect(manageModal(SendTestEmailModal))
