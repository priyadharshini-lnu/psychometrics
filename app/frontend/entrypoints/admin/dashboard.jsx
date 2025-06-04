import { createRoot } from 'react-dom/client'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

import { App as DashboardApp } from '~/modules/admin/modules/Dashboard/App'
import initSentry from '~/libs/initSentry'

initSentry()
const root = createRoot(document.getElementById('dashboard-container'))
root.render(<DashboardApp />)
