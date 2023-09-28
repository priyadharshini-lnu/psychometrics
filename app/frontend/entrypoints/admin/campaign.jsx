import ReactDOM from 'react-dom'
import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'
import initSentry from '~/libs/initSentry'
import CampaignsApp from '~/modules/admin/modules/campaigns/App'

initSentry()
ReactDOM.render(<CampaignsApp />, document.getElementById('campaigns-container'))
