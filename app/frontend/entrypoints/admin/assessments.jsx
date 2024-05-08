import { createRoot } from 'react-dom/client'

import Assessments from '~/modules/admin/modules/Assessments/App'
import initSentry from '~/libs/initSentry'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

initSentry()
const root = createRoot(document.getElementById('assessments'))
root.render(<Assessments />)
