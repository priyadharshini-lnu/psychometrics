import React, { useEffect } from 'react'
import { Route } from 'react-router-dom'
import store, { history } from 'modules/user/store'
import {
  ConfigProvider, notification,
} from 'antd'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import ConnectionCheck from 'components/ConnectionCheck'
import { UserPageLayout } from 'modules/endUser/modules/campaigns/components/UserPageLayout'
import { GlintProvider } from 'glint'

import { connected, disconnected } from 'core/connection'

import { useWindowInnerSize } from 'modules/user/rootHooks'

import routes from './routes'

const { antdLocale, I18n } = window

export default function App () {
  useWindowInnerSize(document.documentElement)
  useEffect(() => {
    const { remainingTime } = store.getState().config.maintenance
    if (remainingTime && remainingTime > 0) {
      setTimeout(() => {
        notification.warning({
          message: I18n.t('frontend.maintenance.notification'),
          duration: 15,
        })
        setTimeout(() => {
          location.reload()
        }, 60000)
      }, (remainingTime - 40) * 1000)
    }
  }, [])

  return (
    <Provider store={store}>
      <ConfigProvider locale={antdLocale} direction={I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'}>
        <GlintProvider>
          <ConnectedRouter history={history}>
            <UserPageLayout>
              <ConnectionCheck
                onConnected={() => store.dispatch(connected())}
                onDisconnected={() => store.dispatch(disconnected())}
              />
              {routes.map((route, i) => (
                <Route key={i} path={route.path} exact={route.exact} component={route.main} />
              ))}
            </UserPageLayout>
          </ConnectedRouter>
        </GlintProvider>
      </ConfigProvider>
    </Provider>
  )
}
