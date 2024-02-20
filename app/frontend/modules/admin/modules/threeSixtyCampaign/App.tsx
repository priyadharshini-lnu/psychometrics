import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import humps from 'humps'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import { ConnectedRouter } from 'connected-react-router'
import { DefaultAntThemeWrapper } from '~/glint'
import store, { history } from '~/modules/admin/store'
import { Schema } from '~/libs/jsonApi/schema'
import { Layout } from './Layout'
import { PortalMenu } from '~/components/MainMenu'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})


export default function App () {
  return (
    <DefaultAntThemeWrapper>
      <div className="ms" style={{ background: 'white' }}>
        <Provider store={store}>
          <ApiProvider client={client}>
            <Router>
              <ConnectedRouter history={history}>
                <PortalMenu />
                <Layout />
              </ConnectedRouter>
            </Router>
          </ApiProvider>
        </Provider>
      </div>
    </DefaultAntThemeWrapper>
  )
}
