import { Provider } from 'react-redux'
import humps from 'humps'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import { DefaultAntThemeWrapper } from '~/glint'
import store from '~/modules/admin/store'
import { Schema } from '~/libs/jsonApi/schema'
import { Layout } from './Layout'

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
            <Layout />
          </ApiProvider>
        </Provider>
      </div>
    </DefaultAntThemeWrapper>
  )
}
