import LangDropdown from 'components/LangDropdown'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import api from 'middleware/api'
import 'modules/user/styles/ant.less'

let composeEnhancers = compose

/* eslint no-underscore-dangle: 0 */
if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: 'User login' })
  }
}

const store = createStore(
  () => ({}),
  {},
  composeEnhancers(applyMiddleware(api)),
)

const locales = I18n.availableLocales
const current = I18n.locale

ReactDOM.render(
  <Provider store={store}>
    <LangDropdown locales={locales} current={current} />
  </Provider>, document.getElementById('lang-dropdown'),
)

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
