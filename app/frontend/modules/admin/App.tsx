import { Provider } from 'react-redux'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import humps from 'humps'
import { Layout as AdminLayout } from '~/modules/admin/Layout'
import store from '~/modules/admin/store'
import { Schema } from '~/libs/jsonApi/schema'
import '~/modules/admin/style.less'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})

const { I18n } = window

const { locale } = document.body.dataset
I18n.locale = locale || I18n.defaultLocale

function App () {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Provider store={store as any}>
      <ApiProvider client={client}>
        {/* No background here — a literal white flashed before the themed shell painted. */}
        <div>
          <DndProvider backend={HTML5Backend}>
            <AdminLayout />
          </DndProvider>
        </div>
      </ApiProvider>
    </Provider>
  )
}

export default App
