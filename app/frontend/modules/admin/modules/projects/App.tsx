import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import store, { history } from 'modules/admin/store'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import RouteList from 'components/RouteList'
import IncorrectResponseErrorModal from 'components/IncorrectResponseErrorModal'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import humps from 'humps'
import cs from 'classnames'
import { Schema } from 'libs/jsonApi/schema'
import settings from './settings'
import { routes } from './routes'
import styles from './App.less'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})

const App: React.FC<void> = () => (
  <div className={cs('ms', styles.container)}>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    <Provider store={store as any}>
      <ApiProvider client={client}>
        <DndProvider backend={HTML5Backend}>
          <Router>
            <ConnectedRouter history={history}>
              <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
            </ConnectedRouter>
          </Router>
        </DndProvider>
        <IncorrectResponseErrorModal />
      </ApiProvider>
    </Provider>
  </div>
)

export default App
