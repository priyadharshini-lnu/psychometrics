import ThreesixtyCampaign from 'modules/user/modules/threesixtyCampaign/App'
import React from 'react'
import ReactDOM from 'react-dom'
import 'modules/user/styles/ant.less'
import 'modules/user/styles/global.scss'

ReactDOM.render(<ThreesixtyCampaign />, document.getElementById('three-sixty-container'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
