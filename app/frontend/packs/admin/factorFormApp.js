import FactorFormApp from 'modules/admin/modules/FactorFormApp'
import ReactDOM from 'react-dom'
import React from 'react'
import 'modules/admin/styles/ant.less'
import 'modules/admin/styles/common.scss'
import initSentry from 'libs/initSentry'

initSentry()

// eslint-disable-next-line no-underscore-dangle
ReactDOM.render(<FactorFormApp {...window.__FACTOR_FORM_PROPS__} />, document.getElementById('factor-form-app'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
