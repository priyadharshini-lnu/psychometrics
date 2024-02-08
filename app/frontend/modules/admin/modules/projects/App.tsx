import React from 'react'
import { ConfigProvider } from 'antd'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import humps from 'humps'
import cs from 'classnames'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import RouteList from '~/components/RouteList'
import store, { history } from '~/modules/admin/store'
import { Schema } from '~/libs/jsonApi/schema'
import settings from './settings'
import { routes } from './routes'
import styles from './App.less'
import { PortalMenu } from '~/components/MainMenu'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})

const App: React.FC<void> = () => (
  <ConfigProvider
    theme={{ token: { colorPrimary: '#009ea7' } }}
  >
    <div className={cs(styles.container)}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Provider store={store as any}>
        <ApiProvider client={client}>
          <DndProvider backend={HTML5Backend}>
            <Router>
              <ConnectedRouter history={history}>
                <PortalMenu />
                <div className="ms">
                  <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
                </div>
              </ConnectedRouter>
            </Router>
          </DndProvider>
          <IncorrectResponseErrorModal />
        </ApiProvider>
      </Provider>
    </div>
  </ConfigProvider>

)

export default App
