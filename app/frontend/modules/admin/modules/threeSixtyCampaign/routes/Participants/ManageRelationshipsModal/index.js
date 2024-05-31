import manageModal from '~/components/hocs/manageModal'
import ManageRelationshipsModal from './ManageRelationshipsModal'
import connect from './connect'

ManageRelationshipsModal.className = 'ManageRelationshipsModal'

export default connect(manageModal(ManageRelationshipsModal))
