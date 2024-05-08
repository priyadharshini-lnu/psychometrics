import { useEffect } from 'react'
import { notification, theme } from 'antd'
import { Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import store, { history } from '~/modules/endUser/store'

import { UserPageLayout } from '~/modules/endUser/modules/campaigns/components/UserPageLayout'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { useWindowInnerSize } from '~/modules/endUser/rootHooks'
import { MAX_PAGE_LOAD_WAIT_TIME } from '~/constants/time'
import { GlintProvider, withLoadingSpinner, DefaultAntThemeWrapper } from '~/glint'
import { constants } from '~/glint/components/DefaultAntThemeWrapper/constants'
import routes from './routes'
import './styles.less'
import { DisplayExceptionModal } from '~/components/DisplayExceptionModal'
import '~/styles/common.less'

const { antdLocale, I18n } = window
const { useToken } = theme
const { DEFAULT_PRIMARY_COLOR, DEFAULT_BORDER_RADIUS } = constants

function App () {
  const { config: { maintenance: { remainingTime }, design } } = store.getState()
  const { token } = useToken()
  useWindowInnerSize(document.documentElement)
  const primaryColor = design.primary_color || DEFAULT_PRIMARY_COLOR

  useEffect(() => {
    if (remainingTime && remainingTime > 0) {
      setTimeout(() => {
        notification.warning({
          message: I18n.t('frontend.maintenance.notification'),
          duration: 15,
        })
        setTimeout(() => {
          location.reload()
        }, 60000)
      }, (remainingTime - 40) * 1000)
    }
  }, [])

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
          },
          components: {
            Progress: {
              defaultColor: primaryColor,
            },
          },
        }}
      >
        <GlintProvider>
          <ConnectedRouter history={history}>
            <UserPageLayout>
              {routes.map((route, i) => (
                <Route key={i} path={route.path} exact={route.exact} component={route.main} />
              ))}
            </UserPageLayout>
            <DisplayExceptionModal />
          </ConnectedRouter>
          <IncorrectResponseErrorModal />
        </GlintProvider>
      </DefaultAntThemeWrapper>
    </Provider>

  )
}

export default withLoadingSpinner(App, MAX_PAGE_LOAD_WAIT_TIME)
