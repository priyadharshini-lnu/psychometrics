import { createRoot } from 'react-dom/client'

import AssessorApp from '~/modules/admin/modules/AssessorApp/App'
import initSentry from '~/libs/initSentry'
import '~/utils/axiosInterceptors'
import '~/utils/fetchRequestInterceptors'
import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'
import setLocale from '~/utils/setLocale'

initSentry()
setLocale()
const root = createRoot(document.getElementById('assessor-app-container'))
root.render(<AssessorApp />)
