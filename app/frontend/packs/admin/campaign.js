import CampaignList from 'modules/admin/campaigns/App'
import ReactDOM from 'react-dom'
import React from 'react'
import 'modules/admin/styles/ant.less'
import 'modules/admin/assets/scss/common.scss'

ReactDOM.render(<CampaignList />, document.getElementById('campaigns-container'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
