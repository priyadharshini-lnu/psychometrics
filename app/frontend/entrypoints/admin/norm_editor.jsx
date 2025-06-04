import { createRoot } from 'react-dom/client'
import NormEditor from '~/modules/admin/modules/NormEditor/App'
import '~/modules/admin/styles/common.less'
import initSentry from '~/libs/initSentry'

initSentry()
/* eslint no-underscore-dangle: 0 */
const root = createRoot(document.getElementById('norm-editor'))
root.render(<NormEditor {...window.__PROPS__} />)
