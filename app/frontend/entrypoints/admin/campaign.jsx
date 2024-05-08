import { createRoot } from 'react-dom/client'
import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'
import initSentry from '~/libs/initSentry'
import CampaignsApp from '~/modules/admin/modules/campaigns/App'

initSentry()
const root = createRoot(document.getElementById('campaigns-container'))
root.render(<CampaignsApp />)
