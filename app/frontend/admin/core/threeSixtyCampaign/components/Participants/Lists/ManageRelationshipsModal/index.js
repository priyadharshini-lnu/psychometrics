import { withRouter } from 'react-router-dom'
import manageModal from 'components/hocs/manageModal'
import ManageRelationshipsModal from './ManageRelationshipsModal'
import connect from './connect'

export default connect(withRouter(manageModal(ManageRelationshipsModal)))
