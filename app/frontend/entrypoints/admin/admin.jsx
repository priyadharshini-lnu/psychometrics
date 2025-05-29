import { createRoot } from 'react-dom/client'
import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'
import '~/utils/fetchRequestInterceptors'
import '~/utils/axiosInterceptors'
import App from '~/modules/admin/App'
import initSentry from '~/libs/initSentry'
import setLocale from '~/utils/setLocale'

initSentry()
setLocale()

const root = createRoot(document.getElementById('admin-app-container'))
root.render(<App />)
