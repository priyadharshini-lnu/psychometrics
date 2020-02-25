import ThreesixtyCampaign from 'user/core/ThreesixtyCampaign/components/App'
import React from 'react'
import ReactDOM from 'react-dom'
import 'user/styles/ant.less'
import 'user/styles/global.scss'

ReactDOM.render(<ThreesixtyCampaign />, document.getElementById('three-sixty-container'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
