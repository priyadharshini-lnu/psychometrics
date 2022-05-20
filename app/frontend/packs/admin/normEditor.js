import NormEditor from 'modules/admin/modules/NormEditor/App'
import ReactDOM from 'react-dom'
import React from 'react'
import 'modules/admin/styles/ant.less'
import 'modules/admin/styles/common.less'
import initSentry from 'libs/initSentry'

initSentry()
/* eslint no-underscore-dangle: 0 */
ReactDOM.render(<NormEditor {...window.__PROPS__} />, document.getElementById('norm-editor'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
