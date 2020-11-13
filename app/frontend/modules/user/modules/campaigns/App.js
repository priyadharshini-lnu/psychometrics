import React from 'react'
import {
  BrowserRouter as Router, Route,
} from 'react-router-dom'
import { ConfigProvider } from 'antd'
import store from 'modules/user/store'
import { Provider } from 'react-redux'
import ConnectionCheck from 'components/ConnectionCheck'
import { connected, disconnected } from 'core/connection'
import routes from './routes'
import PageLayout from './components/PageLayout'

const { antdLocale } = window

export default function App () {
  return (
    <Provider store={store}>
      <ConfigProvider locale={antdLocale} direction={I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'}>
        <Router>
          <PageLayout>
            <ConnectionCheck
              onConnected={() => store.dispatch(connected())}
              onDisconnected={() => store.dispatch(disconnected())}
            />
            {routes.map((route, i) => (
              <Route
                key={i}
                path={route.path}
                exact={route.exact}
                component={route.main}
              />
            ))}
          </PageLayout>
        </Router>
      </ConfigProvider>
    </Provider>
  )
}
