import ReactDOM from 'react-dom'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

import initSentry from '~/libs/initSentry'

import DatasheetManagementApp from '~/modules/admin/modules/SheetManagement/App'

initSentry()

ReactDOM.render(
  <DatasheetManagementApp />,
  document.getElementById('datasheet-management-container'),
)
