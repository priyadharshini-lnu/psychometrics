import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import humps from 'humps'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import { Schema } from '~/libs/jsonApi/schema'
import { DefaultAntThemeWrapper } from '~/glint'

import store from './store'
import AdminJobList from './AdminJobList'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})
export default function App () {
  return (
    <DefaultAntThemeWrapper>
      <Provider store={store}>
        <ApiProvider client={client}>
          <Router>
            <AdminJobList />
          </Router>
        </ApiProvider>
      </Provider>
    </DefaultAntThemeWrapper>
  )
}
