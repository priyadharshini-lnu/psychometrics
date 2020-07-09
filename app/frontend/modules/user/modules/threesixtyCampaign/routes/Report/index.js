
import Report from './Report'
import Sidebar from './Sidebar'
import connect from './connect'

export default connect(Report)

export const ReportSidebar = connect(Sidebar)
