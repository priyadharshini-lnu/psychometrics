import { createRoot } from 'react-dom/client'
import App from '~/modules/admin/modules/AdminJob/App'
import '~/utils/axiosInterceptors'
import '~/utils/fetchRequestInterceptors'
import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'
import initSentry from '~/libs/initSentry'

initSentry()
/* eslint no-underscore-dangle: 0 */
if (document.getElementById('admin-job-wrapper')) {
  const root = createRoot(document.getElementById('admin-job-wrapper'))
  root.render(<App />)
}
