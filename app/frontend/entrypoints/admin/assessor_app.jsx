import ReactDOM from 'react-dom'

import AssessorApp from '~/modules/admin/modules/AssessorApp/App'
import initSentry from '~/libs/initSentry'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

initSentry()
ReactDOM.render(<AssessorApp />, document.getElementById('assessor-app-container'))
