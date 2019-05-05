
import Evaluation from './Evaluation'
import Sidebar from './Sidebar'
import connect from './connect'

export default connect(Evaluation)

export const EvaluationSidebar = connect(Sidebar)
