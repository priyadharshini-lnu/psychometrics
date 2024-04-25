import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import humps from 'humps'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import store, { history } from '~/modules/admin/store'
import RouteList from '~/components/RouteList'
import { DefaultAntThemeWrapper } from '~/glint'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { DisplayExceptionModal } from '~/components/DisplayExceptionModal'
import { Schema } from '~/libs/jsonApi/schema'
import { PortalMenu } from '~/components/MainMenu'
import routes from './routes'
import settings from './settings'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})


const App: React.FC<void> = () => (
  <div style={{ background: 'white' }}>
    <DefaultAntThemeWrapper>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Provider store={store as any}>
        <ApiProvider client={client}>
          <DndProvider backend={HTML5Backend}>
            <Router>
              <ConnectedRouter history={history}>
                <PortalMenu />
                <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
              </ConnectedRouter>
            </Router>
          </DndProvider>
          <IncorrectResponseErrorModal />
          <DisplayExceptionModal />
        </ApiProvider>
      </Provider>
    </DefaultAntThemeWrapper>
  </div>
)

export default App
