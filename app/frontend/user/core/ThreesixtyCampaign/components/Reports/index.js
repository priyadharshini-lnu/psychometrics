
import Reports from './Reports'
import Sidebar from './Sidebar'
import connect from './connect'

export default connect(Reports)

export const ReportsSidebar = connect(Sidebar)
