import { createRoot } from 'react-dom/client'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

import ClientApp from '~/modules/admin/modules/client/App'
import initSentry from '~/libs/initSentry'

initSentry()
const root = createRoot(document.getElementById('client-container'))
root.render(<ClientApp />)
