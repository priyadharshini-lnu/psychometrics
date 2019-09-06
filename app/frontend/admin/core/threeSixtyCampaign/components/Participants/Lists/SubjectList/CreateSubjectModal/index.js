import manageModal from 'components/hocs/manageModal'
import CreateSubjectModal from './CreateSubjectModal'
import connect from './connect'

CreateSubjectModal.className = 'CreateSubjectModal'

export default connect(manageModal(CreateSubjectModal))
