import manageModal from 'components/hocs/manageModal'
import CreateSubjectModal from './CreateSubjectModal'
import connect from './connect'

export default connect(manageModal(CreateSubjectModal))
