import ReactDOM from 'react-dom'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

import { App as ReportApprovalsApp } from '~/modules/admin/modules/ReportApprovals/App'
import initSentry from '~/libs/initSentry'

initSentry()
ReactDOM.render(<ReportApprovalsApp />, document.getElementById('report-approvals-container'))
