import Campaigns from 'modules/user/modules/campaigns/App'
import React from 'react'
import ReactDOM from 'react-dom'
import 'modules/user/styles/ant.less'
import 'modules/user/styles/global.scss'
import 'styles/utils.scss'
import initSentry from 'libs/initSentry'

initSentry()

ReactDOM.render(<Campaigns />, document.getElementById('three-sixty-container'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
