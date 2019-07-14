import manageModal from 'components/hocs/manageModal'
import SendTestEmailModal from './SendTestEmailModal'
import connect from './connect'

export default connect(manageModal(SendTestEmailModal))
