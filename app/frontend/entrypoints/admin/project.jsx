import ReactDOM from 'react-dom'
import React from 'react'
import ProjectsApp from '~/modules/admin/modules/projects/App'
import '~/styles/ant.less'
import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'
import initSentry from '~/libs/initSentry'

initSentry()

ReactDOM.render(<ProjectsApp />, document.getElementById('project-container'))
