import ReactDOM from 'react-dom'
import ProjectsApp from '~/modules/admin/modules/projects/App'
import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'
import initSentry from '~/libs/initSentry'

initSentry()

ReactDOM.render(<ProjectsApp />, document.getElementById('project-container'))
