import { Provider } from 'react-redux'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import humps from 'humps'
import { Layout as AdminLayout } from '~/modules/admin/Layout'
import store from '~/modules/admin/store'
import { Schema } from '~/libs/jsonApi/schema'
import { DefaultAntThemeWrapper } from '~/glint'
import '~/modules/admin/style.less'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})

const { antdLocale, I18n } = window

const { locale } = document.body.dataset
I18n.locale = locale || I18n.defaultLocale

function App () {
  // Ordering dependency: its useSetCssVars runs before GlintAdminTheme's bridge, which then wins on --ant-*.
  return (
    <DefaultAntThemeWrapper
      locale={antdLocale}
      direction={I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* No background here — a literal white flashed before the themed shell painted. */}
      <div>
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
