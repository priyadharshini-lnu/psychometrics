import Nomination from './Nomination'
import Sidebar from './Sidebar'
import connect from './connect'

export default connect(Nomination)

export const NominationSidebar = connect(Sidebar)
