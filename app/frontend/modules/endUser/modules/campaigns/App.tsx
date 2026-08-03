import { lazy, Suspense } from 'react'
import { theme } from 'antd'
import { px2remTransformer, StyleProvider } from '@ant-design/cssinjs'
import { BrowserRouter as Router, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '~/modules/endUser/store'

import { UserPageLayout } from '~/modules/endUser/modules/campaigns/components/UserPageLayout'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { useWindowInnerSize } from '~/modules/endUser/rootHooks'
import { MAX_PAGE_LOAD_WAIT_TIME } from '~/constants/time'
import { GlintProvider, withLoadingSpinner, DefaultAntThemeWrapper } from '~/glint'
import { constants } from '~/glint/components/DefaultAntThemeWrapper/constants'
import { getGlintUi } from '~/modules/endUser/core/config'
import routes from './routes'
import { DisplayExceptionModal } from '~/components/DisplayExceptionModal'
import { SessionTimeoutModal } from '~/components/SessionTimeoutModal'
import '~/styles/common.less'
import RouteList from '~/components/RouteList'
import ErrorModal from '~/components/ErrorModal'

// Loaded (and their glint CSS/font side-effects incurred) only when the flag is on, so an
// unflagged project's pages are byte-for-byte the legacy tree.
const AppTheme = lazy(() => import('~/modules/endUser/AppTheme'))
const DashboardPage = lazy(() => import('~/modules/endUser/pages/DashboardPage'))
const ProgramDetailsPage = lazy(() => import('~/modules/endUser/pages/ProgramDetailsPage'))
const ChangePasswordPage = lazy(() => import('~/modules/endUser/pages/ChangePasswordPage'))
const ProfilePage = lazy(() => import('~/modules/endUser/pages/ProfilePage'))
const UserPage = lazy(() => import('~/modules/endUser/pages/UserPage'))

// The dashboard answers both the index route and its `/dashboard` alias.
const DASHBOARD_PATHS = ['/', '/dashboard']

const CHANGE_PASSWORD_PATH = '/change_password'
const PROFILE_PATH = '/profile_details'

// Program details swaps only the campaign root (`/campaigns/:id`); deeper campaign routes
// (insights, system check, assessments) and assessment-center detail links
// (`?assessmentCenterId=`) stay on the legacy tree.
const PROGRAM_DETAILS_PATH = /^\/campaigns\/\d+$/

const { antdLocale, I18n } = window
const { useToken } = theme
const { DEFAULT_PRIMARY_COLOR, DEFAULT_BORDER_RADIUS, GREY_BORDER } = constants
const px2rem = px2remTransformer({
  rootValue: 16,
})

// The page-level flag swap: the flag swaps WHOLE PAGES, never branches inside the legacy
// chrome. Flag on + dashboard route → the self-contained glint DashboardPage (under its own
// theme, outside the legacy px2rem transform — transforming popup position styles breaks antd
// alignment); every other route renders the unchanged UserPageLayout tree.
const AppBody = ({ glintUi }: { glintUi: boolean }) => {
  const { pathname, search } = useLocation()

  const glintPage = (() => {
    if (!glintUi) return null
    if (DASHBOARD_PATHS.includes(pathname)) return <DashboardPage />
    if (PROGRAM_DETAILS_PATH.test(pathname) && !search.includes('assessmentCenterId')) {
      return <ProgramDetailsPage />
    }
    if (pathname === CHANGE_PASSWORD_PATH) return <ChangePasswordPage />
    if (pathname === PROFILE_PATH) return <ProfilePage />
    return null
  })()

  if (glintPage) {
    // The shell (UserPage) mounts once here and stays across route changes;
    // only the page content swaps, so the rail never remounts or flashes.
    return (
      <Suspense fallback={null}>
        <AppTheme>
          <UserPage>
            {glintPage}
          </UserPage>
        </AppTheme>
      </Suspense>
    )
  }

  return (
    <StyleProvider transformers={[px2rem]}>
      <UserPageLayout>
        <RouteList routes={routes} urlPrefix="/" />
      </UserPageLayout>
    </StyleProvider>
  )
}

function App () {
  const { config: { design } } = store.getState()
  const glintUi = getGlintUi(store.getState())
  const { token } = useToken()
  useWindowInnerSize(document.documentElement)
  const primaryColor = design.primary_color || DEFAULT_PRIMARY_COLOR

  return (
    <Provider store={store}>
      <DefaultAntThemeWrapper
        locale={antdLocale}
        direction={I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'}
        theme={{
          token: {
            colorPrimary: primaryColor,
            colorError: design.error_color || token.colorError,
            colorWarning: design.warning_color || token.colorWarning,
            colorSuccess: design.success_color || token.colorSuccess,
            colorInfo: design.info_color || token.colorInfo,
            borderRadius: DEFAULT_BORDER_RADIUS,
            colorLink: primaryColor,
            colorBorder: GREY_BORDER,
          },
          components: {
            Progress: {
              defaultColor: primaryColor,
            },
          },
        }}
      >
        <GlintProvider>
          <Router>
            <AppBody glintUi={glintUi} />
            <DisplayExceptionModal />
            <SessionTimeoutModal />
            <IncorrectResponseErrorModal />
            <ErrorModal />
          </Router>
        </GlintProvider>
      </DefaultAntThemeWrapper>
    </Provider>

  )
}

export default withLoadingSpinner(App, MAX_PAGE_LOAD_WAIT_TIME)
