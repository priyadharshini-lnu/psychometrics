import { createRoot } from 'react-dom/client'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

import { App as ReportApprovalsApp } from '~/modules/admin/modules/ReportApprovals/App'
import initSentry from '~/libs/initSentry'

initSentry()
const root = createRoot(document.getElementById('report-approvals-container'))
root.render(<ReportApprovalsApp />)
