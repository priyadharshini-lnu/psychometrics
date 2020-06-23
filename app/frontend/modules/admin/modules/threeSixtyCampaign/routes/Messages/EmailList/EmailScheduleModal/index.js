import manageModal from 'components/hocs/manageModal'
import EmailScheduleModal from './EmailScheduleModal'
import connect from './connect'

EmailScheduleModal.className = 'EmailScheduleModal'

export default connect(manageModal(EmailScheduleModal))
