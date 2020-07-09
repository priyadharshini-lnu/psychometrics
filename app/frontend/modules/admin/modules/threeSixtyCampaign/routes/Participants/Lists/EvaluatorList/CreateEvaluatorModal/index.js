import manageModal from 'components/hocs/manageModal'
import CreateEvaluatorModal from './CreateEvaluatorModal'
import connect from './connect'

CreateEvaluatorModal.className = 'CreateEvaluatorModal'

export default connect(manageModal(CreateEvaluatorModal))
