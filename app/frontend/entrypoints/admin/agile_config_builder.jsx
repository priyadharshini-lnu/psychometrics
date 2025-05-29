import { createRoot } from 'react-dom/client'
import AgileConfigBuilder from '~/modules/admin/modules/AgileConfigBuilder/App'
import '~/modules/admin/styles/common.less'
import initSentry from '~/libs/initSentry'
import setLocale from '~/utils/setLocale'

initSentry()
setLocale()
/* eslint no-underscore-dangle: 0 */
const root = createRoot(document.getElementById('agile-config-builder'))
root.render(<AgileConfigBuilder {...window.__PROPS__} />)
