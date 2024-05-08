import { createRoot } from 'react-dom/client'
import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'
import '~/utils/axiosInterceptException'
import App from '~/modules/admin/App'
import initSentry from '~/libs/initSentry'

initSentry()

const root = createRoot(document.getElementById('admin-app-container'))
root.render(<App />)
