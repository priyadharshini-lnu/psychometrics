import { createRoot } from 'react-dom/client'

import AuditLog from '~/modules/admin/modules/AuditLog/App'
import initSentry from '~/libs/initSentry'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

initSentry()
const root = createRoot(document.getElementById('audit-logs'))
root.render(<AuditLog />)
