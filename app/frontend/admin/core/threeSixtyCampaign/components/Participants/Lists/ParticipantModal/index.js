import { withRouter } from 'react-router-dom'
import ParticipantModal from './ParticipantModal'
import connect from './connect'

export default connect(withRouter(ParticipantModal))
