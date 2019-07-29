import manageModal from 'components/hocs/manageModal'
import PipedTextModal from './PipedTextModal'
import connect from './connect'

PipedTextModal.className = 'PipedTextModal'

export default connect(manageModal(PipedTextModal))
