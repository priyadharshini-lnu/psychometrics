import { createRoot } from 'react-dom/client'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

import { App as IndividualDashboard } from '~/modules/admin/modules/IndividualDashboard/App'
import initSentry from '~/libs/initSentry'

initSentry()
const root = createRoot(document.getElementById('individual-dashboard-container'))
root.render(<IndividualDashboard />)
