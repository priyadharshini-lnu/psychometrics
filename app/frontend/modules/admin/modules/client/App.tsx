import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import humps from 'humps'
import { routes } from './routes'
import settings from './settings'
import store from '~/modules/admin/store'
import RouteList from '~/components/RouteList'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { Schema } from '~/libs/jsonApi/schema'
import { PortalMenu } from '~/components/MainMenu'
import { DefaultAntThemeWrapper } from '~/glint'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})

const App: React.FC<void> = () => (
  <DefaultAntThemeWrapper>
    <div style={{ background: 'white' }}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Provider store={store as any}>
        <ApiProvider client={client}>
          <DndProvider backend={HTML5Backend}>
            <Router>
              <PortalMenu />
              <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
              <IncorrectResponseErrorModal />
            </Router>
          </DndProvider>
        </ApiProvider>
      </Provider>
    </div>
  </DefaultAntThemeWrapper>
)

export default App
