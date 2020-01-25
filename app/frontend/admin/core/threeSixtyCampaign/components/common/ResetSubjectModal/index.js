import manageModal from 'components/hocs/manageModal'
import ResetSubjectModal from './ResetSubjectModal'
import connect from './connect'

ResetSubjectModal.className = 'ResetSubjectModal'

export default connect(manageModal(ResetSubjectModal))
