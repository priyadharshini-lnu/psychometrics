import manageModal from 'components/hocs/manageModal'
import EmailScheduleModal from './EmailScheduleModal'
import connect from './connect'

export default connect(manageModal(EmailScheduleModal))
