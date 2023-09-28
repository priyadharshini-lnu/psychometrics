import ReactDOM from 'react-dom'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

import { App as UserAvailabilityApp } from '~/modules/admin/modules/UserAvailability/App'
import initSentry from '~/libs/initSentry'

initSentry()
ReactDOM.render(<UserAvailabilityApp />, document.getElementById('user-availability'))
