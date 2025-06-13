import React from 'react'
import { Provider } from 'react-redux'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import humps from 'humps'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import store from '~/modules/admin/store'
import { DefaultAntThemeWrapper } from '~/glint'
import { Schema } from '~/libs/jsonApi/schema'
import { Layout } from './Layout'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})

const { antdLocale, I18n } = window

const { locale } = document.body.dataset
I18n.locale = locale || I18n.defaultLocale


const App: React.FC<void> = () => (
  <div style={{ background: 'white' }}>
    <DefaultAntThemeWrapper
      locale={antdLocale}
      direction={I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Provider store={store as any}>
        <ApiProvider client={client}>
          <DndProvider backend={HTML5Backend}>
            <Layout />
          </DndProvider>
        </ApiProvider>
      </Provider>
    </DefaultAntThemeWrapper>
  </div>
)

export default App
