import React, { useEffect } from 'react'
import { ConfigProvider, notification } from 'antd'
import { Route } from 'react-router-dom'
import store, { history } from 'modules/endUser/store'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import _ from 'lodash'
import humps from 'humps'

import ConnectionCheck from 'components/ConnectionCheck'
import { UserPageLayout } from 'modules/endUser/modules/campaigns/components/UserPageLayout'
import IncorrectResponseErrorModal from 'components/IncorrectResponseErrorModal'
import { GlintProvider, withLoadingSpinner } from 'glint'

import { connected, disconnected } from 'core/connection'

import { useWindowInnerSize } from 'modules/endUser/rootHooks'
import { MAX_PAGE_LOAD_WAIT_TIME } from 'constants/time'
import routes from './routes'
import './styles.less'

const { antdLocale, I18n } = window

function App () {
  useWindowInnerSize(document.documentElement)

  useEffect(() => {
    const { config: { maintenance: { remainingTime }, design } } = store.getState()
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

    ConfigProvider.config({
      theme: humps.camelizeKeys(
        _.pick(design, ['primary_color', 'error_color', 'warning_color', 'success_color', 'info_color']),
      ),
    })
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
          <IncorrectResponseErrorModal />
        </GlintProvider>
      </ConfigProvider>
    </Provider>
  )
}

export default withLoadingSpinner(App, MAX_PAGE_LOAD_WAIT_TIME)
