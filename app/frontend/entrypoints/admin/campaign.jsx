import ReactDOM from 'react-dom'
import React from 'react'
import '~/styles/ant.less'
import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'
import initSentry from '~/libs/initSentry'
import CampaignsApp from '~/modules/admin/modules/campaigns/App'

initSentry()
ReactDOM.render(<CampaignsApp />, document.getElementById('campaigns-container'))
