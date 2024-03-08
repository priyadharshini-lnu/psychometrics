import { createRoot } from 'react-dom/client'

import Users from '~/modules/admin/modules/Users/App'
import initSentry from '~/libs/initSentry'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

initSentry()
const root = createRoot(document.getElementById('users'))
root.render(<Users />)
