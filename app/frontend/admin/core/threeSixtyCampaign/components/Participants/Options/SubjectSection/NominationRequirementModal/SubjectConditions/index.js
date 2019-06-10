import { withRouter } from 'react-router-dom'
import SubjectConditions from './SubjectConditions'
import connect from './connect'

export default connect(withRouter(SubjectConditions))
