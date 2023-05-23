import ReactDOM from 'react-dom'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

import { App as DashboardApp } from '~/modules/admin/modules/Dashboard/App'
import initSentry from '~/libs/initSentry'

initSentry()
ReactDOM.render(<DashboardApp />, document.getElementById('dashboard-container'))
