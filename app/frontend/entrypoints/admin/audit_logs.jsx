import ReactDOM from 'react-dom'

import AuditLog from '~/modules/admin/modules/AuditLog/App'
import initSentry from '~/libs/initSentry'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

initSentry()
ReactDOM.render(<AuditLog />, document.getElementById('audit-logs'))
