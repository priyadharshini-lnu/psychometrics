import manageModal from 'components/hocs/manageModal'
import SubjectImportModal from './SubjectImportModal'
import connect from './connect'

export default connect(manageModal(SubjectImportModal))
