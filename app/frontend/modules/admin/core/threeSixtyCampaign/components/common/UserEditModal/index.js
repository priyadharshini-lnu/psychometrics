import manageModal from 'components/hocs/manageModal'
import UserEditModal from './UserEditModal'
import connect from './connect'

UserEditModal.className = 'UserEditModal'

export default connect(manageModal(UserEditModal))
