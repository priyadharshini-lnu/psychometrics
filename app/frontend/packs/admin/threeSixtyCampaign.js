import ThreeSixtyApp from 'modules/admin/core/threeSixtyCampaign/components/App'
import ReactDOM from 'react-dom'
import React from 'react'
import 'modules/admin/styles/ant.less'
import 'modules/admin/assets/scss/common.scss'

ReactDOM.render(<ThreeSixtyApp />, document.getElementById('three-sixty-container'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
