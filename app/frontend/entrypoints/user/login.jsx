import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import api from '~/middleware/api'
import App from '~/modules/auth/App'
import reducers from '~/modules/auth/core/reducers'
import setLocale from '~/utils/setLocale'

setLocale()

let composeEnhancers = compose

/* eslint no-underscore-dangle: 0 */
if (__DEV__) {
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: 'User#Login' })
  }
}

const store = createStore(
  reducers(),
  window.__INITIAL_STATE__ || {},
  composeEnhancers(applyMiddleware(api)),
)

const element = document.getElementById('devise')

if (element) {
  const root = createRoot(element)
  root.render(
    <Provider store={store}>
      <App />
    </Provider>,
  )
}
