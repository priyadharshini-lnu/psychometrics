import { Provider } from 'react-redux'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import humps from 'humps'
import { Layout as AdminLayout } from '~/modules/admin/Layout'
import store from '~/modules/admin/store'
import { Schema } from '~/libs/jsonApi/schema'
import { DefaultAntThemeWrapper } from '~/glint'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})

function App () {
  return (
    <DefaultAntThemeWrapper>
      <div style={{ background: 'white' }}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Provider store={store as any}>
          <ApiProvider client={client}>
            <DndProvider backend={HTML5Backend}>
              <AdminLayout />
            </DndProvider>
          </ApiProvider>
        </Provider>
      </div>
    </DefaultAntThemeWrapper>
  )
}

export default App
