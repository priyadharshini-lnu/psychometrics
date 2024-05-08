import { createRoot } from 'react-dom/client'
import ProjectsApp from '~/modules/admin/modules/projects/App'
import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'
import initSentry from '~/libs/initSentry'

initSentry()

const root = createRoot(document.getElementById('project-container'))
root.render(<ProjectsApp />)
