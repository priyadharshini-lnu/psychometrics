import manageModal from 'components/hocs/manageModal'
import EvaluatorImportModal from './EvaluatorImportModal'
import connect from './connect'

EvaluatorImportModal.className = 'EvaluatorImportModal'

export default connect(manageModal(EvaluatorImportModal))
