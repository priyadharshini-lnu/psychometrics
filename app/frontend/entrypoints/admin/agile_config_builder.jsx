import { createRoot } from 'react-dom/client'
import AgileConfigBuilder from '~/modules/admin/modules/AgileConfigBuilder/App'
import { GlintAdminTheme } from '~/components/AdminShell/GlintAdminTheme'
import '~/modules/admin/styles/common.less'
import initSentry from '~/libs/initSentry'

initSentry()
/* eslint no-underscore-dangle: 0 */
const root = createRoot(document.getElementById('agile-config-builder'))
root.render(
  <GlintAdminTheme>
    <AgileConfigBuilder {...window.__PROPS__} />
  </GlintAdminTheme>,
)
