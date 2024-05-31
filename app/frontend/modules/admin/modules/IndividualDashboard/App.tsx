import React from 'react'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import humps from 'humps'
import { Provider } from 'react-redux'
import store from '~/modules/admin/store'
import { Schema } from '~/libs/jsonApi/schema'
import { Layout } from './Layout'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})

export const App: React.FC = () => (
  <div className="ms-2" style={{ background: 'white' }}>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    <Provider store={store as any}>
      <ApiProvider client={client}>
        <Layout />
      </ApiProvider>
    </Provider>
  </div>
)
