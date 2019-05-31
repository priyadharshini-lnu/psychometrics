import { withRouter } from 'react-router-dom'
import List from './List'
import connect from './connect'

export default connect(withRouter(List))
