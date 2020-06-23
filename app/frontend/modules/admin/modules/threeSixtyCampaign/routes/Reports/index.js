import Reports from './Reports'
import EditSubject from './EditSubject'
import Options from './Options'
import MyReports from './MyReports'
import connect from './connect'

Reports.EditSubject = EditSubject
Reports.Options = Options
Reports.MyReports = MyReports
export default connect(Reports)
