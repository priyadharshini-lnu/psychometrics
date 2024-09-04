import { createRoot } from 'react-dom/client'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

import initSentry from '~/libs/initSentry'

import DatasheetManagementApp from '~/modules/admin/modules/SheetManagement/App'

initSentry()

const root = createRoot(document.getElementById('datasheet-management-container'))
root.render(<DatasheetManagementApp />)
