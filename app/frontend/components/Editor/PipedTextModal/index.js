import manageModal from 'components/hocs/manageModal'
import PipedTextModal from './PipedTextModal'
import connect from './connect'

export default connect(manageModal(PipedTextModal))
