import manageModal from 'components/hocs/manageModal'
import RecipientListModal from './RecipientListModal'
import connect from './connect'

RecipientListModal.className = 'RecipientListModal'

export default connect(manageModal(RecipientListModal))
