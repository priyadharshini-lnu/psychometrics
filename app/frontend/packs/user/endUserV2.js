import Campaigns from 'modules/endUser/modules/campaigns/App'
import React from 'react'
import ReactDOM from 'react-dom'
import 'styles/ant.less'
import 'modules/user/styles/global.less'
import 'styles/utils.less'

import initSentry from 'libs/initSentry'

initSentry()

ReactDOM.render(<Campaigns />, document.getElementById('endUserContainer'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
