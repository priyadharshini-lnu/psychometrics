import Campaigns from 'modules/user/modules/campaigns/App'
import React from 'react'
import ReactDOM from 'react-dom'
import jQuery from 'jquery'
import 'modules/user/styles/ant.less'
import 'modules/user/styles/global.scss'
import initSentry from 'libs/initSentry'

window.$ = jQuery
window.jQuery = jQuery

initSentry()

ReactDOM.render(<Campaigns />, document.getElementById('three-sixty-container'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
