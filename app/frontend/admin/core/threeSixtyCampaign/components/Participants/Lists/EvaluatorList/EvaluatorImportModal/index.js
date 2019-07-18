import manageModal from 'components/hocs/manageModal'
import EvaluatorImportModal from './EvaluatorImportModal'
import connect from './connect'

export default connect(manageModal(EvaluatorImportModal))
