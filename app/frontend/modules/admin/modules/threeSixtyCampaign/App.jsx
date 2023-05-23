import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import humps from 'humps'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import store from '~/modules/admin/store'
import RouteList from '~/components/RouteList'
import { Schema } from '~/libs/jsonApi/schema'
import routes from './routes'
import { TopMenu } from './components/TopMenu'
import settings from './settings'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})


export default function App () {
  return (
    <div className="ms" style={{ background: 'white' }}>
      <Provider store={store}>
        <ApiProvider client={client}>
          <Router>
            <TopMenu />
            <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
          </Router>
        </ApiProvider>
      </Provider>
    </div>
  )
}
