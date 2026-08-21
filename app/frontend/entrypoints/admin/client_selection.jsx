import { createRoot } from 'react-dom/client'
import { GlintAdminTheme, choiceFrom } from '~/components/AdminShell/GlintAdminTheme'
import { THEME_CATEGORY, THEME_CONFIG_KEY } from '~/components/AdminShell/useThemePreference'
import { currentUserFromInitialState, findPreference } from '~/components/AdminShell/currentUserDetails'
import { ClientSelection } from '~/modules/admin/modules/ClientSelection/routes/ClientSelection'

const { I18n } = window
const { locale } = document.body.dataset
I18n.locale = locale || I18n.defaultLocale

// eslint-disable-next-line no-underscore-dangle
const clients = window.__CLIENT_SELECTION__ || []
// eslint-disable-next-line no-underscore-dangle
const spoofUserId = window.__SPOOF_USER_ID__ || null

const container = document.getElementById('client-selection-container')
const root = createRoot(container)

// No store here on purpose: this page mounts without the SPA's providers, so it reads the server payload directly.
const preferences = currentUserFromInitialState()?.preferences ?? []

root.render(
  <GlintAdminTheme choice={choiceFrom(findPreference(preferences, THEME_CATEGORY, THEME_CONFIG_KEY))}>
    <ClientSelection clients={clients} spoofUserId={spoofUserId} />
  </GlintAdminTheme>,
)
