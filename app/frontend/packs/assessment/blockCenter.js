import React from 'react'
import ReactDOM from 'react-dom'
import BlockCenter from 'libs/survey/containers/BlockCenterContainer'

const ID = window.blockCenterDomElementId || 'psychometrics_block_center'
ReactDOM.render(<BlockCenter />, document.getElementById(ID))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
