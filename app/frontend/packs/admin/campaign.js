import CampaignsApp from 'modules/admin/modules/campaigns/App'
import ReactDOM from 'react-dom'
import React from 'react'
import 'styles/ant.js'
import 'modules/admin/styles/common.less'
import 'styles/utils.less'
import initSentry from 'libs/initSentry'

initSentry()
ReactDOM.render(<CampaignsApp />, document.getElementById('campaigns-container'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
