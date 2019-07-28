import { withRouter } from 'react-router-dom'
import manageModal from 'components/hocs/manageModal'
import NominationRequirementModal from './NominationRequirementModal'
import connect from './connect'

NominationRequirementModal.className = 'NominationRequirementModal'

export default connect(withRouter(manageModal(NominationRequirementModal)))
