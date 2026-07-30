import { ConfigProvider } from 'antd'
import { px2remTransformer, StyleProvider } from '@ant-design/cssinjs'
import { Locale } from 'antd/es/locale'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { AuthLayout } from './Layout'
import AuthTheme from './AuthTheme'
import { ADMIN_FORGOT_PASSWORD_PATH, ADMIN_LOGIN_PATHS } from './adminGlintRoutes'
import { RootState } from './core/reducers'
import { LoginPage } from './pages/LoginPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { SignupPage } from './pages/SignupPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'

const { antdLocale, I18n } = window
const px2rem = px2remTransformer({ rootValue: 16 })

export const AuthApp = () => {
  const glintUi = useSelector((state: RootState) => Boolean(state.projectConfig?.glint_ui))
  const direction = I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'

  // Only the legacy tree may run under px2rem; transforming glint's styles destabilizes antd alignment.
  const legacy = (
    <StyleProvider transformers={[px2rem]}>
      <ConfigProvider locale={antdLocale as Locale} direction={direction}>
        <AuthLayout />
      </ConfigProvider>
    </StyleProvider>
  )

  return (
    <Router>
      <Routes>
        {ADMIN_LOGIN_PATHS.map(path => (
          <Route key={path} path={path} element={<AuthTheme><AdminLoginPage /></AuthTheme>} />
        ))}
        <Route path={ADMIN_FORGOT_PASSWORD_PATH} element={<AuthTheme><ForgotPasswordPage /></AuthTheme>} />
        {glintUi ? (
          <>
            <Route path="/users/sign_in" element={<AuthTheme><LoginPage /></AuthTheme>} />
            <Route path="/users/sign_up" element={<AuthTheme><SignupPage /></AuthTheme>} />
            <Route path="/users" element={<AuthTheme><SignupPage /></AuthTheme>} />
            <Route path="/users/password/new" element={<AuthTheme><ForgotPasswordPage /></AuthTheme>} />
          </>
        ) : null}
        <Route path="*" element={legacy} />
      </Routes>
    </Router>
  )
}

export default AuthApp
