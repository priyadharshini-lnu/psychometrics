import { withRouter } from 'react-router-dom'
import Pagination from './Pagination'
import connect from './connect'

export default withRouter(connect(Pagination))
