import manageModal from 'components/hocs/manageModal'
import CreateEvaluatorModal from './CreateEvaluatorModal'
import connect from './connect'

export default connect(manageModal(CreateEvaluatorModal))
