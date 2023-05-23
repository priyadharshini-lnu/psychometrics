import ReactDOM from 'react-dom'

import Users from '~/modules/admin/modules/Users/App'
import initSentry from '~/libs/initSentry'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

initSentry()
ReactDOM.render(<Users />, document.getElementById('users'))
