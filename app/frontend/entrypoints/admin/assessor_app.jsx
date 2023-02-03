import ReactDOM from 'react-dom'
import React from 'react'

import AssessorApp from '~/modules/admin/modules/AssessorApp/App'
import initSentry from '~/libs/initSentry'

import '~/styles/ant.less'
import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

initSentry()
ReactDOM.render(<AssessorApp />, document.getElementById('assessor-app-container'))
