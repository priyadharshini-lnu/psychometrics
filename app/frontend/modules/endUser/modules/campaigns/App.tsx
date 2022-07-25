import React, { useEffect, useState, useMemo } from 'react'
import { Route } from 'react-router-dom'
import store, { history } from 'modules/user/store'
import { ConfigProvider, notification, Col } from 'antd'
import {
  HomeOutlined,
  MessageOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import { ToggleEndUserViewLink } from 'components/ToggleEndUserViewLink'
import ConnectionCheck from 'components/ConnectionCheck'
import LangDropdown from 'components/LangDropdown'
import { Footer } from 'modules/endUser/modules/campaigns/components/Footer'
import { Profile } from 'modules/endUser/modules/campaigns/components/Profile'
import { PageLayout, GlintProvider } from 'glint'

import { connected, disconnected } from 'core/connection'

import { useWindowInnerSize } from 'modules/user/rootHooks'

import routes from './routes'

const { antdLocale, I18n } = window

const locales = I18n.availableLocales
const current = I18n.locale

const items = [
  {
    key: 'dashboard',
    label: I18n.t('campaign.dashboard_menu.home'),
    icon: <HomeOutlined />,
  },
  /* {
  //   key: 'privacy',
  //   label: 'Privacy',
  //   icon: <LockOutlined />,
  // },
  // {
  //   key: 'help',
  //   label: 'Help',
  //   icon: <QuestionCircleOutlined />,
      }, */
  {
    key: 'profile',
    label: I18n.t('campaign.dashboard_menu.profile'),
    icon: <UserOutlined />,
  },
  {
    key: 'livechat',
    label: I18n.t('campaign.dashboard_menu.livechat'),
    icon: <MessageOutlined />,
  },
]

export default function App () {
  const [showChat, setShowChat] = useState(false)
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

  useEffect(() => {
    const chatStatus = showChat ? 'open' : 'close'
    window.$chatwoot && window.$chatwoot.toggle(chatStatus)
  }, [showChat])

  const handleMenu = (menu) => {
    if (menu.key === 'livechat') {
      setShowChat(showChat => !showChat)
    } else {
      history.push(`/${menu.key}`)
    }
  }

  const headerElement = (
    <Col flex="auto" span={24} className="ta-e">
      <LangDropdown locales={locales} current={current} />
    </Col>
  )
  const renderProfile = (collapsed: boolean) => useMemo(() => (<Profile collapsed={collapsed} />), [collapsed])


  return (
    <Provider store={store}>
      <ConfigProvider locale={antdLocale} direction={I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'}>
        <GlintProvider>
          <ConnectedRouter history={history}>
            <PageLayout
              siderItems={items}
              siderFooter={renderProfile}
              headerContent={headerElement}
              onSiderMenuClick={handleMenu}
              footer={<Footer />}
            >
              <ConnectionCheck
                onConnected={() => store.dispatch(connected())}
                onDisconnected={() => store.dispatch(disconnected())}
              />
              <ToggleEndUserViewLink />
              {routes.map((route, i) => (
                <Route key={i} path={route.path} exact={route.exact} component={route.main} />
              ))}
            </PageLayout>
          </ConnectedRouter>
        </GlintProvider>
      </ConfigProvider>
    </Provider>
  )
}
