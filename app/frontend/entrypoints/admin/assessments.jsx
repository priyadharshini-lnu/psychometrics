import ReactDOM from 'react-dom'

import Assessments from '~/modules/admin/modules/Assessments/App'
import initSentry from '~/libs/initSentry'

import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

initSentry()
ReactDOM.render(<Assessments />, document.getElementById('assessments'))
