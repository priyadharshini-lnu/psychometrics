import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import humps from 'humps'
import { Provider } from 'react-redux'
import store from '~/modules/admin/store'
import RouteList from '~/components/RouteList'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { Schema } from '~/libs/jsonApi/schema'
import routes from './routes'
import { settings } from './settings'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})

export const App: React.FC = () => (
  <div className="ms-2" style={{ background: 'white' }}>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    <Provider store={store as any}>
      <ApiProvider client={client}>
        <Router>
          <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
          <IncorrectResponseErrorModal />
        </Router>
      </ApiProvider>
    </Provider>
  </div>
)
