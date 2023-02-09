import ReactDOM from 'react-dom'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

import { App as IndividualDashboard } from '~/modules/admin/modules/IndividualDashboard/App'
import initSentry from '~/libs/initSentry'

initSentry()
ReactDOM.render(<IndividualDashboard />, document.getElementById('individual-dashboard-container'))
