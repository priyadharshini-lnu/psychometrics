import { createRoot } from 'react-dom/client'
import { DefaultAntThemeWrapper } from '~/glint'
import { ClientSelection } from '~/modules/admin/modules/ClientSelection/routes/ClientSelection'

const { antdLocale, I18n } = window
const { locale } = document.body.dataset
I18n.locale = locale || I18n.defaultLocale

// eslint-disable-next-line no-underscore-dangle
const clients = window.__CLIENT_SELECTION__ || []
// eslint-disable-next-line no-underscore-dangle
const spoofUserId = window.__SPOOF_USER_ID__ || null

const container = document.getElementById('client-selection-container')
const root = createRoot(container)

root.render(
  <DefaultAntThemeWrapper
    locale={antdLocale}
    direction={I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'}
  >
    <ClientSelection clients={clients} spoofUserId={spoofUserId} />
  </DefaultAntThemeWrapper>,
)
