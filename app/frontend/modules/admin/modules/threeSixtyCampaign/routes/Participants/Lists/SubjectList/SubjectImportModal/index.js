import manageModal from 'components/hocs/manageModal'
import SubjectImportModal from './SubjectImportModal'
import connect from './connect'

SubjectImportModal.className = 'SubjectImportModal'

export default connect(manageModal(SubjectImportModal))
