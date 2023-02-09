import { ConfigProvider } from 'antd'
import { Locale } from 'antd/lib/locale-provider'
import { ConnectedRouter } from 'connected-react-router'

import { AuthLayout } from './Layout'

const { antdLocale, I18n } = window

export const App = ({ history }) => {
  const direction = I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'

  return (
    <ConfigProvider locale={antdLocale as Locale} direction={direction}>
      <ConnectedRouter history={history}>
        <AuthLayout />
      </ConnectedRouter>
    </ConfigProvider>
  )
}

export default App
