import { withRouter } from 'react-router-dom'
import Tabs from './Tabs'
import connect from './connect'

export default connect(withRouter(Tabs))
