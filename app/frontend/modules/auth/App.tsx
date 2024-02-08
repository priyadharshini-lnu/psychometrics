import { ConfigProvider } from 'antd'
import { Locale } from 'antd/lib/locale'
import { ConnectedRouter } from 'connected-react-router'
import { DefaultAntThemeWrapper } from '~/glint'

import { AuthLayout } from './Layout'

const { antdLocale, I18n } = window

export const App = ({ history }) => {
  const direction = I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'

  return (
    <DefaultAntThemeWrapper>
      <ConfigProvider locale={antdLocale as Locale} direction={direction}>
        <ConnectedRouter history={history}>
          <AuthLayout />
        </ConnectedRouter>
      </ConfigProvider>
    </DefaultAntThemeWrapper>
  )
}

export default App
