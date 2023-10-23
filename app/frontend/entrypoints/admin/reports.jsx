import ReactDOM from 'react-dom'

import Reports from '~/modules/admin/modules/Reports/App'
import initSentry from '~/libs/initSentry'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

initSentry()
ReactDOM.render(<Reports />, document.getElementById('reports'))
