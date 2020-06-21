import CampaignList from 'admin/campaigns/App'
import ReactDOM from 'react-dom'
import React from 'react'
import 'admin/styles/ant.less'
import 'admin/assets/scss/common.scss'

ReactDOM.render(<CampaignList />, document.getElementById('campaigns-container'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
