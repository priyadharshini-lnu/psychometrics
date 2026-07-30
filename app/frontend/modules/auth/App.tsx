import { Suspense, lazy } from 'react'
import { ConfigProvider } from 'antd'
import { px2remTransformer, StyleProvider } from '@ant-design/cssinjs'
import { Locale } from 'antd/es/locale'
import { BrowserRouter as Router } from 'react-router-dom'
import { useSelector } from 'react-redux'
import '~/styles/utils.less'
import '~/styles/common.less'

import { AuthLayout } from './Layout'
import { isAdminGlintRoute } from './adminGlintRoutes'
import { RootState } from './core/reducers'

const { antdLocale, I18n } = window
const px2rem = px2remTransformer({
  rootValue: 16,
})

// Lazy so an unflagged project pulls in zero glint CSS/font side-effects and stays byte-for-byte legacy.
const AuthApp = lazy(() => import('./AuthApp'))

const LegacyAuthApp = () => {
  const direction = I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'

  return (
    <ConfigProvider locale={antdLocale as Locale} direction={direction}>
      <Router>
        <StyleProvider transformers={[px2rem]}>
          <AuthLayout />
        </StyleProvider>
      </Router>
    </ConfigProvider>
  )
}

export const App = () => {
  const glintUi = useSelector((state: RootState) => Boolean(state.projectConfig?.glint_ui))
  const onAdminRoute = isAdminGlintRoute(window.location.pathname)

  if (glintUi || onAdminRoute) {
    return (
      <Suspense fallback={null}>
        <AuthApp />
      </Suspense>
    )
  }

  return <LegacyAuthApp />
}

export default App
