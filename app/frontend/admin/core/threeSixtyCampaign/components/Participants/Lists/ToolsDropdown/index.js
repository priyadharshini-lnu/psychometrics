import { withRouter } from 'react-router-dom'
import ToolsDropdown from './ToolsDropdown'
import connect from './connect'

export default connect(withRouter(ToolsDropdown))
