import { createRoot } from 'react-dom/client'
import AgileConfigBuilder from '~/modules/admin/modules/AgileConfigBuilder/App'
import '~/modules/admin/styles/common.less'
import initSentry from '~/libs/initSentry'

initSentry()
/* eslint no-underscore-dangle: 0 */
const root = createRoot(document.getElementById('agile-config-builder'))
root.render(<AgileConfigBuilder {...window.__PROPS__} />)
