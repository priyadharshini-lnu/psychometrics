import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { DefaultAntThemeWrapper } from '~/glint'
import RouteList from '~/components/RouteList'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import store, { history } from './store'
import routes from './routes'
import settings from './settings'
import { PortalMenu } from '~/components/MainMenu'

const App: React.FC<void> = () => (
  <div style={{ background: 'white' }}>
    <DefaultAntThemeWrapper>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Provider store={store as any}>
        <DndProvider backend={HTML5Backend}>
          <Router>
            <ConnectedRouter history={history}>
              <PortalMenu />
              <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
            </ConnectedRouter>
          </Router>
        </DndProvider>
        <IncorrectResponseErrorModal />
      </Provider>
    </DefaultAntThemeWrapper>
  </div>
)

export default App
