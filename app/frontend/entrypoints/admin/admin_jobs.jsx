import ReactDOM from 'react-dom'
import App from '~/modules/admin/modules/AdminJob/App'
import '~/modules/admin/styles/common.less'
import initSentry from '~/libs/initSentry'

initSentry()
/* eslint no-underscore-dangle: 0 */
ReactDOM.render(<App />, document.getElementById('admin-job-wrapper'))
