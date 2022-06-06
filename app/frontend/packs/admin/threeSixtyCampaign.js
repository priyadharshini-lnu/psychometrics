import ThreeSixtyApp from 'modules/admin/modules/threeSixtyCampaign/App'
import ReactDOM from 'react-dom'
import React from 'react'
import 'styles/ant.js'
import 'modules/admin/styles/common.less'
import 'styles/utils.less'

import initSentry from 'libs/initSentry'

initSentry()

ReactDOM.render(<ThreeSixtyApp />, document.getElementById('three-sixty-container'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
