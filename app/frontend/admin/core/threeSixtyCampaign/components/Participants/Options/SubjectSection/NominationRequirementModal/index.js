import { withRouter } from 'react-router-dom'
import NominationRequirementModal from './NominationRequirementModal'
import connect from './connect'

export default connect(withRouter(NominationRequirementModal))
