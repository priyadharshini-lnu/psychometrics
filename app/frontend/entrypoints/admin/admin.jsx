import ReactDOM from 'react-dom'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

import App from '~/modules/admin/App'
import initSentry from '~/libs/initSentry'

initSentry()
ReactDOM.render(<App />, document.getElementById('admin-app-container'))
