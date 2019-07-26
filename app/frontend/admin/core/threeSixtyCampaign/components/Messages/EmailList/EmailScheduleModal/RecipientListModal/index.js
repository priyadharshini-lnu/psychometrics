import manageModal from 'components/hocs/manageModal'
import RecipientListModal from './RecipientListModal'
import connect from './connect'

export default connect(manageModal(RecipientListModal))
