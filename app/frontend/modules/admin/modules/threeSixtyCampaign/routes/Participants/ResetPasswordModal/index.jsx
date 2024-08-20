import manageModal from '~/components/hocs/manageModal'
import { ResetPasswordModal } from '~/modules/admin/modules/Users/routes/UserList/ResetPasswordModal'
import connect from './connect'

ResetPasswordModal.className = 'ResetPasswordModal'

export default connect(manageModal(ResetPasswordModal))
