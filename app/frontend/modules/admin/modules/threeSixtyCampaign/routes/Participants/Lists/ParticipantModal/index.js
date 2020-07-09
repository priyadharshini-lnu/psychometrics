import { withRouter } from 'react-router-dom'
import manageModal from 'components/hocs/manageModal'
import ParticipantModal from './ParticipantModal'
import connect from './connect'

ParticipantModal.className = 'ParticipantModal'

export default connect(withRouter(manageModal(ParticipantModal)))
